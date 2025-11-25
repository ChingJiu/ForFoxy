/* ============================================================
   FIREBASE
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, set,
  onChildAdded, onChildChanged, onChildRemoved
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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

initializeApp(firebaseConfig);
const db = getDatabase();
const ornamentsRef = ref(db, "ornaments_shared");

/* ============================================================
   DOM ELEMENTS
============================================================ */
const treeContainer = document.getElementById("tree-container");
const decorateLayer = document.getElementById("decorate-layer");

/* ============================================================
   TAP TO ADD ORNAMENT
============================================================ */
document.querySelectorAll(".ornament-template").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    const id = "ornament_" + Date.now();

    const rect = treeContainer.getBoundingClientRect();

    // Place in the center
    const x = 50;
    const y = 50;

    const model = {
      id,
      type,
      x, y,
      scale: 1,
      rotation: 0
    };

    set(ref(db, "ornaments_shared/" + id), model);
  });
});

/* ============================================================
   RENDER ORNAMENT
============================================================ */
function renderOrnament(model) {
  const existing = document.getElementById(model.id);
  if (existing) existing.remove();

  const map = {
    star: "star.png",
    red: "bauble-red.png",
    blue: "bauble-blue.png",
    candy: "candy.png",
    bell: "bell.png"
  };

  const el = document.createElement("img");
  el.src = "ornaments/" + (map[model.type] || "bell.png");
  el.classList.add("placed");
  el.id = model.id;

  updateElement(el, model);
  decorateLayer.appendChild(el);

  attachPointerControls(el, model);
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
   POINTER CONTROLS (iPad SAFE)
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
      }, 650);
    }

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      start.dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      start.angle = Math.atan2(p2.clientY - p1.clientY,
                               p2.clientX - p1.clientX) * (180 / Math.PI);

      start.scale = model.scale;
      start.rotation = model.rotation;
    }
  });

  el.addEventListener("pointermove", e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    clearTimeout(model.delTimer);

    const rect = treeContainer.getBoundingClientRect();

    if (pointers.size === 1) {
      const p = e;

      // convert movement to %
      const dxPerc = ((p.clientX - start.x) / rect.width) * 100;
      const dyPerc = ((p.clientY - start.y) / rect.height) * 100;

      model.x = Math.max(0, Math.min(100, start.modelX + dxPerc));
      model.y = Math.max(0, Math.min(100, start.modelY + dyPerc));

      updateElement(el, model);
      set(ref(db, "ornaments_shared/" + model.id), model);
    }

    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());

      // scaling
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      model.scale = Math.max(0.4, Math.min(2.8, start.scale * (dist / start.dist)));

      // rotation
      const angle = Math.atan2(p2.clientY - p1.clientY,
                               p2.clientX - p1.clientX) * (180 / Math.PI);
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

/* ============================================================
   FIREBASE LISTENERS
============================================================ */
onChildAdded(ornamentsRef, snap => renderOrnament(snap.val()));
onChildChanged(ornamentsRef, snap => renderOrnament(snap.val()));
onChildRemoved(ornamentsRef, snap => {
  const el = document.getElementById(snap.key);
  if (el) el.remove();
});

/* ============================================================
   SAVE SCREENSHOT BUTTON
============================================================ */
import html2canvas from "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js";

document.getElementById("save-btn").addEventListener("click", () => {
  html2canvas(document.body, { backgroundColor: null })
    .then(canvas => {
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "tree.png";
      a.click();
    });
});
