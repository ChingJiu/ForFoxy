/* ============================================================
   FIREBASE INITIALIZE
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase, ref, set, onChildAdded, onChildChanged, onChildRemoved }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCb9k3GJPoykO1QQiiteSKdRFYFwYqCRkU",
  authDomain: "christmas-tree-67873.firebaseapp.com",
  databaseURL: "https://christmas-tree-67873-default-rtdb.firebaseio.com",
  projectId: "christmas-tree-67873",
  storageBucket: "christmas-tree-67873.firebasestorage.app",
  messagingSenderId: "1030522218712",
  appId: "1:1030522218712:web:6b01f57afd9a1b8eff8fad",
  measurementId: "G-GF6YYKBJBQ"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);
const ornamentsRef = ref(db, "ornaments_shared");


/* ============================================================
   DOM ELEMENTS
============================================================ */
const stage = document.getElementById("stage");
const decorateLayer = document.getElementById("decorate-layer");


// -------------------------
// Tap to add ornament from tray
// -------------------------
document.querySelectorAll(".ornament-template").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const id = "ornament_" + Date.now();

    // Default placement: center of tree
    const rect = treeContainer.getBoundingClientRect();
    const x = rect.width / 2;
    const y = rect.height / 2;

    const ornamentData = { id, type, x, y, scale: 1, rotation: 0 };
    set(ref(db, "ornaments_shared/" + id), ornamentData);
  });
});


/* ============================================================
   RENDER ORNAMENT INSTANCE
============================================================ */
function renderOrnament(model) {
  const existing = document.getElementById(model.id);
  if (existing) existing.remove();

  const img = document.createElement("img");
  img.classList.add("placed");
  img.id = model.id;

  const sourceMap = {
    star: "star.png",
    red: "bauble-red.png",
    blue: "bauble-blue.png",
    candy: "candy.png",
    bell: "bell.png"
  };

  img.src = "ornaments/" + (sourceMap[model.type] || "bell.png");

  img.style.left = model.x + "%";
  img.style.top  = model.y + "%";
  img.style.transform =
      `translate(-50%, -50%) scale(${model.scale}) rotate(${model.rotation}deg)`;

  decorateLayer.appendChild(img);

  attachPointerControls(img, model);
}


/* ============================================================
   POINTER EVENTS (Touch + Mouse)
============================================================ */
function attachPointerControls(el, model) {
  const pointers = new Map();
  let start = {};

  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, e);

    if (pointers.size === 1) {
      const p = e;
      start.x = p.clientX;
      start.y = p.clientY;
      start.modelX = model.x;
      start.modelY = model.y;

      model.delTimer = setTimeout(() => {
        set(ref(db, "ornaments_shared/" + model.id), null);
        el.remove();
      }, 600);
    }

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      start.dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      start.angle = Math.atan2(p2.clientY - p1.clientY,
                               p2.clientX - p1.clientX) * 180 / Math.PI;

      start.scale = model.scale;
      start.rotation = model.rotation;
    }
  });


  el.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    clearTimeout(model.delTimer);

    const rect = stage.getBoundingClientRect();

    if (pointers.size === 1) {
      const p = e;
      const dx = ((p.clientX - start.x) / rect.width) * 100;
      const dy = ((p.clientY - start.y) / rect.height) * 100;

      model.x = Math.max(0, Math.min(100, start.modelX + dx));
      model.y = Math.max(0, Math.min(100, start.modelY + dy));

      updateElement(el, model);
      set(ref(db, "ornaments_shared/" + model.id), model);
    }

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);

      model.scale = Math.max(0.4, Math.min(2.5, start.scale * (dist / start.dist)));

      const angle = Math.atan2(p2.clientY - p1.clientY,
                               p2.clientX - p1.clientX) * 180 / Math.PI;
      model.rotation = start.rotation + (angle - start.angle);

      updateElement(el, model);
      set(ref(db, "ornaments_shared/" + model.id), model);
    }
  });


  el.addEventListener("pointerup", e => {
    pointers.delete(e.pointerId);
    clearTimeout(model.delTimer);
  });

  el.addEventListener("pointercancel", e => {
    pointers.delete(e.pointerId);
    clearTimeout(model.delTimer);
  });
}
function attachInteraction(el, model) {
  let dragging = false;
  let startX, startY, startModelX, startModelY;

  el.addEventListener("pointerdown", e => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startModelX = model.x;
    startModelY = model.y;
    el.setPointerCapture(e.pointerId);

    // long press delete
    model._deleteTimer = setTimeout(() => {
      el.remove();
      set(ref(db, "ornaments_shared/" + model.id), null);
    }, 700);
  });

  el.addEventListener("pointermove", e => {
    if (!dragging) return;

    clearTimeout(model._deleteTimer);

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    model.x = startModelX + dx;
    model.y = startModelY + dy;

    el.style.left = model.x + "px";
    el.style.top = model.y + "px";

    set(ref(db, "ornaments_shared/" + model.id), model);
  });

  el.addEventListener("pointerup", e => {
    dragging = false;
    clearTimeout(model._deleteTimer);
  });
}


/* ============================================================
   UPDATE ELEMENT
============================================================ */
function updateElement(el, model) {
  el.style.left = model.x + "%";
  el.style.top  = model.y + "%";
  el.style.transform =
      `translate(-50%, -50%) scale(${model.scale}) rotate(${model.rotation}deg)`;
}


/* ============================================================
   REALTIME LISTENERS
============================================================ */
onChildAdded(ornamentsRef, snap => renderOrnament(snap.val()));
onChildChanged(ornamentsRef, snap => renderOrnament(snap.val()));
onChildRemoved(ornamentsRef, snap => {
  const el = document.getElementById(snap.key);
  if (el) el.remove();
});
