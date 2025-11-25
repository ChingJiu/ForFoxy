<script type="module">
  // -------------------------
  // Firebase SDK (Modular)
  // -------------------------
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getDatabase, ref, set, onChildAdded } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

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

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const ornamentsRef = ref(db, "ornaments_shared");

  // -------------------------
  // Drag & Drop from tray
  // -------------------------
  const treeContainer = document.getElementById("tree-container");
  document.querySelectorAll(".ornament").forEach(o => {
    o.addEventListener("dragstart", e => e.dataTransfer.setData("type", o.dataset.type));
  });

  treeContainer.addEventListener("dragover", e => e.preventDefault());

  treeContainer.addEventListener("drop", e => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const id = "ornament_" + Date.now();
    const x = e.offsetX;
    const y = e.offsetY;
    const ornamentData = { id, type, x, y, scale: 1, rotation: 0 };
    set(ref(db, "ornaments_shared/" + id), ornamentData);
  });

  // -------------------------
  // Render ornaments
  // -------------------------
  function renderOrnament({ id, type, x, y, scale = 1, rotation = 0 }) {
    const img = document.createElement("img");
    img.src = `ornaments/${{
      star: "star.png",
      red: "bauble-red.png",
      blue: "bauble-blue.png",
      candy: "candy.png",
      bell: "bell.png"
    }[type] || "bell.png"}`;
    img.classList.add("placed");
    img.id = id;
    img.style.left = x + "px";
    img.style.top = y + "px";
    img.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;

    attachInteraction(img, { id, x, y, scale, rotation });
    treeContainer.appendChild(img);
  }

  // -------------------------
  // Drag / Resize / Rotate / Delete
  // -------------------------

function attachDrag(el, model) {
  let active = false;
  let startX, startY;
  let startModelX, startModelY;
  let startDist = 0;
  let startAngle = 0;

  let initialScale = model.scale || 1;
  let initialRotation = model.rotation || 0;

  let pointers = new Map(); // track multiple fingers

  applyTransform();

  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    el.setPointerCapture(e.pointerId);

    pointers.set(e.pointerId, e);

    if (pointers.size === 1) {
      // Single finger: drag
      active = true;
      const first = Array.from(pointers.values())[0];
      startX = first.clientX;
      startY = first.clientY;
      startModelX = model.x;
      startModelY = model.y;
    } else if (pointers.size === 2) {
      // Two fingers: start pinch/rotate
      const [p1, p2] = Array.from(pointers.values());
      startDist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      startAngle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);
      initialScale = model.scale || 1;
      initialRotation = model.rotation || 0;
    }
  });

  el.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    if (pointers.size === 1) {
      // drag
      const p = Array.from(pointers.values())[0];
      const rect = stage.getBoundingClientRect();
      const dx = (p.clientX - startX) / rect.width * 100;
      const dy = (p.clientY - startY) / rect.height * 100;
      model.x = Math.max(2, Math.min(98, startModelX + dx));
      model.y = Math.max(2, Math.min(98, startModelY + dy));
      el.style.left = model.x + "%";
      el.style.top = model.y + "%";
    } else if (pointers.size === 2) {
      // pinch/rotate
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      const angle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180 / Math.PI);

      model.scale = Math.max(0.4, Math.min(2.5, initialScale * (dist / startDist)));
      model.rotation = initialRotation + (angle - startAngle);
      applyTransform();
    }
  });

  el.addEventListener("pointerup", (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      active = false;
      saveLocalDebounced();
    }
  });

  el.addEventListener("pointercancel", (e) => pointers.delete(e.pointerId));

  // long-press delete
  let delTimer;
  el.addEventListener("pointerdown", () => {
    delTimer = setTimeout(() => {
      ornaments = ornaments.filter(x => x.id !== model.id);
      renderOrnaments();
      saveLocalDebounced();
    }, 600);
  });
  el.addEventListener("pointerup", () => clearTimeout(delTimer));
  el.addEventListener("pointermove", () => clearTimeout(delTimer));

  function applyTransform() {
    const s = model.scale || 1;
    const r = model.rotation || 0;
    el.style.transform = `translate(-50%, -50%) scale(${s}) rotate(${r}deg)`;
  }
}

  function attachInteraction(el, model) {
    let active = false, startX, startY, startXModel, startYModel;
    let initialScale = model.scale, initialRotation = model.rotation;

    el.addEventListener("pointerdown", e => {
      e.preventDefault();
      active = true;
      startX = e.clientX;
      startY = e.clientY;
      startXModel = model.x;
      startYModel = model.y;
      el.setPointerCapture(e.pointerId);

      // long press delete
      model.delTimer = setTimeout(() => {
        el.remove();
        set(ref(db, "ornaments_shared/" + model.id), null);
      }, 600);
    });

    el.addEventListener("pointermove", e => {
      if (!active) return;

      const rect = treeContainer.getBoundingClientRect();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (e.shiftKey) { // scale
        model.scale = Math.max(0.4, Math.min(2.5, initialScale + dx / 100));
      } else if (e.altKey) { // rotate
        model.rotation = initialRotation + dx;
      } else { // move
        model.x = Math.max(0, Math.min(rect.width, startXModel + dx));
        model.y = Math.max(0, Math.min(rect.height, startYModel + dy));
      }

      el.style.left = model.x + "px";
      el.style.top = model.y + "px";
      el.style.transform = `translate(-50%, -50%) scale(${model.scale}) rotate(${model.rotation}deg)`;

      // save live to Firebase
      set(ref(db, "ornaments_shared/" + model.id), model);
    });

    el.addEventListener("pointerup", e => {
      active = false;
      clearTimeout(model.delTimer);
    });
  }

  // -------------------------
  // Listen for new ornaments
  // -------------------------
  onChildAdded(ornamentsRef, snapshot => renderOrnament(snapshot.val()));
</script>
