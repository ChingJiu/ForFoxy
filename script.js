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
