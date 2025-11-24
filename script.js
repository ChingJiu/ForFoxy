<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
  
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
  const analytics = getAnalytics(app);
</script>

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* JSON storage location */
const ornamentsRef = db.ref("ornaments_shared");

/* ============= Drag & Drop ============= */

const treeContainer = document.getElementById("tree-container");

document.querySelectorAll(".ornament").forEach(o => {
  o.addEventListener("dragstart", e => {
    e.dataTransfer.setData("type", e.target.dataset.type);
  });
});

treeContainer.addEventListener("dragover", e => e.preventDefault());

treeContainer.addEventListener("drop", e => {
  e.preventDefault();

  const type = e.dataTransfer.getData("type");
  const x = e.offsetX;
  const y = e.offsetY;

  const id = "ornament_" + Date.now();

  const ornamentData = { id, type, x, y };

  ornamentsRef.child(id).set(ornamentData);
});

/* ============= Render ornaments ============= */

function renderOrnament({ id, type, x, y }) {
  const img = document.createElement("img");
  img.src = `ornaments/${type === 'star' ? 'star.png' :
                         type === 'red' ? 'bauble-red.png' :
                         type === 'blue' ? 'bauble-blue.png' :
                         type === 'candy' ? 'candy.png' :
                                            'bell.png'}`;

  img.classList.add("placed");
  img.style.left = x + "px";
  img.style.top = y + "px";
  img.id = id;

  treeContainer.appendChild(img);
}

function attachDrag(el, model) {
  let active = false;
  let startX, startY;
  let startModelX, startModelY;
  let startDist = 0;
  let startAngle = 0;

  let initialScale = model.scale || 1;
  let initialRotation = model.rotation || 0;

  let fingers = [];

  applyTransform();

  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    active = true;
    startX = e.clientX;
    startY = e.clientY;
    startModelX = model.x;
    startModelY = model.y;
    el.setPointerCapture(e.pointerId);
    fingers = [e];
  });

  el.addEventListener("pointermove", (e) => {
    if (!active) return;

    // Track fingers
    if (e.pointerType === "touch") {
      const existing = fingers.findIndex(f => f.pointerId === e.pointerId);
      if (existing >= 0) fingers[existing] = e;
      else fingers.push(e);

      if (fingers.length === 1) {
        // Single-finger drag
        const rect = stage.getBoundingClientRect();
        const dx = (e.clientX - startX) / rect.width * 100;
        const dy = (e.clientY - startY) / rect.height * 100;

        model.x = Math.max(2, Math.min(98, startModelX + dx));
        model.y = Math.max(2, Math.min(98, startModelY + dy));
        el.style.left = model.x + "%";
        el.style.top = model.y + "%";
      }

      if (fingers.length === 2) {
        // Two-finger gesture: scale + rotate
        const [f1, f2] = fingers;
        const dx = f2.clientX - f1.clientX;
        const dy = f2.clientY - f1.clientY;

        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (!startDist) {
          startDist = dist;
          startAngle = angle;
          initialScale = model.scale || 1;
          initialRotation = model.rotation || 0;
        }

        model.scale = Math.max(0.4, Math.min(2.5, initialScale * (dist / startDist)));
        model.rotation = initialRotation + (angle - startAngle);
        applyTransform();
      }

      return;
    }

    // Desktop behaviour
    const rect = stage.getBoundingClientRect();
    const dx = (e.clientX - startX) / rect.width * 100;
    const dy = (e.clientY - startY) / rect.height * 100;

    if (e.shiftKey) {
      // Scale
      model.scale = Math.max(0.4, Math.min(2.5, initialScale + dx / 50));
      applyTransform();
      return;
    }

    if (e.altKey) {
      // Rotate
      model.rotation = initialRotation + dx * 3;
      applyTransform();
      return;
    }

    // Move (default)
    model.x = Math.max(2, Math.min(98, startModelX + dx));
    model.y = Math.max(2, Math.min(98, startModelY + dy));
    el.style.left = model.x + "%";
    el.style.top = model.y + "%";
  });

  el.addEventListener("pointerup", () => {
    active = false;
    fingers = [];
    startDist = 0;
    saveLocalDebounced();
  });

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
 
/* Update for all users in real time */
ornamentsRef.on("child_added", snapshot => {
  renderOrnament(snapshot.val());
});
