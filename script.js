// script.js (must be loaded with: <script type="module" src="script.js"></script>)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, set,
  onChildAdded, onChildChanged, onChildRemoved
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ================================
   Firebase Init
================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCb9k3GJPoykO1QQiiteSKdRFYFwYqCRkU",
  authDomain: "christmas-tree-67873.firebaseapp.com",
  databaseURL: "https://christmas-tree-67873-default-rtdb.firebaseio.com",
  projectId: "christmas-tree-67873",
  storageBucket: "christmas-tree-67873.firebasestorage.app",
  messagingSenderId: "1030522218712",
  appId: "1:1030522218712:web:6b01f57afd9a1b8eff8fad"
};

initializeApp(firebaseConfig);
const db = getDatabase();
const ORN_REF = ref(db, "ornaments_shared");

/* ================================
   DOM
================================ */
const stage = document.getElementById("stage");
const tray = document.getElementById("ornament-tray");
const decorateLayer = document.getElementById("decorate-layer");
const themeToggle = document.getElementById("theme-toggle");
const trashZone = document.getElementById("trash-zone");

/* ================================
   Helpers
================================ */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => "orn_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

function pxToPct(x, y) {
  const r = stage.getBoundingClientRect();
  return {
    x: clamp(((x - r.left) / r.width) * 100, 0, 100),
    y: clamp(((y - r.top) / r.height) * 100, 0, 100)
  };
}

function pctToPx(xPct, yPct) {
  const r = stage.getBoundingClientRect();
  return {
    left: (xPct / 100) * r.width,
    top: (yPct / 100) * r.height
  };
}

function saveModel(model) {
  set(ref(db, `ornaments_shared/${model.id}`), model);
}

function deleteModel(id) {
  set(ref(db, `ornaments_shared/${id}`), null);
}

const SRC = {
  star:"star.png",
  red:"bauble-red.png",
  blue:"bauble-blue.png",
  candy:"candy.png",
  bell:"bell.png",
  ginger:"ginger.png",
  present:"present.png"
};

/* ================================
   Ornaments
================================ */
function createElement(model) {
  let el = document.getElementById(model.id);
  if (el) return el;

  el = document.createElement("img");
  el.id = model.id;
  el.className = "placed-ornament";
  el.style.position = "absolute";
  el.style.touchAction = "none";
  el.draggable = false;
  decorateLayer.appendChild(el);

  attachPointerControls(el, model);
  return el;
}

function render(model) {
  const el = createElement(model);
  el.src = "ornaments/" + SRC[model.type];

  const px = pctToPx(model.x, model.y);
  el.style.left = px.left + "px";
  el.style.top = px.top + "px";

  el.style.transform =
    `translate(-50%,-50%) scale(${model.scale}) rotate(${model.rotation}deg)`;
}

function removeLocal(id){
  const el = document.getElementById(id);
  if (el) el.remove();
}

/* ================================
   Trash-zone detection
================================ */
function isOverTrash(el) {
  if (!trashZone) return false;
  const tz = trashZone.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  return cx>=tz.left && cx<=tz.right && cy>=tz.top && cy<=tz.bottom;
}

/* ================================
   Pointer Controls
================================ */
function attachPointerControls(el, model){
  const pointers = new Map();
  let start = {};

  function updateVisual(){
    render(model);
  }

  el.addEventListener("pointerdown", e=>{
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, e);

    if (pointers.size===1){
      const p = e;
      start = {
        x: p.clientX,
        y: p.clientY,
        mx: model.x,
        my: model.y,
        rect: stage.getBoundingClientRect()
      };
    }

    if (pointers.size===2){
      const [a,b] = [...pointers.values()];
      start.dist = Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
      start.ang = Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX)*180/Math.PI;
      start.scale = model.scale;
      start.rot = model.rotation;
    }
  });

  window.addEventListener("pointermove", e=>{
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    if (pointers.size===1){
      const p = [...pointers.values()][0];
      const dx = ((p.clientX - start.x)/start.rect.width)*100;
      const dy = ((p.clientY - start.y)/start.rect.height)*100;

      model.x = clamp(start.mx + dx, 0, 100);
      model.y = clamp(start.my + dy, 0, 100);
      updateVisual();
      saveModel(model);
    }

    if (pointers.size===2){
      const [a,b] = [...pointers.values()];
      const dist = Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
      const ang = Math.atan2(b.clientY-a.clientY,b.clientX-a.clientX)*180/Math.PI;

      model.scale = clamp(start.scale*(dist/start.dist), 0.05, 3);
      model.rotation = start.rot + (ang - start.ang);
      updateVisual();
      saveModel(model);
    }
  });

  window.addEventListener("pointerup", e=>{
    if (pointers.has(e.pointerId)) pointers.delete(e.pointerId);

    if (isOverTrash(el)){
      deleteModel(model.id);
      el.remove();
      return;
    }

    saveModel(model);
  });
}

/* ================================
   Tap-to-add
================================ */
tray.querySelectorAll("img").forEach(t=>{
  t.addEventListener("click", ()=>{
    const type = t.dataset.type;
    const id = uid();

    const model = {
      id,
      type,
      x:50,
      y:45,
      scale:0.2,
      rotation:0
    };

    saveModel(model);
  });
});

/* ================================
   Firebase Events
================================ */
onChildAdded(ORN_REF, snap=>{
  const m = snap.val();
  render(m);
});

onChildChanged(ORN_REF, snap=>{
  const m = snap.val();
  render(m);
});

onChildRemoved(ORN_REF, snap=>{
  removeLocal(snap.key);
});

/* ================================
   Theme Toggle
================================ */
if (themeToggle){
  themeToggle.addEventListener("change", ()=>{
    const mode = themeToggle.checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("theme", mode);
  });

  const saved = localStorage.getItem("theme");
  if (saved){
    document.documentElement.setAttribute("data-theme", saved);
    themeToggle.checked = saved==="dark";
  }
}

console.log("script.js ready.");
