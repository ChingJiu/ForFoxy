// script.js
// Use with <script type="module" src="script.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, set, onChildAdded, onChildChanged, onChildRemoved
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ===========================
   CONFIG - replace if needed
   =========================== */
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

/* ===========================
   INIT Firebase
   =========================== */
initializeApp(firebaseConfig);
const db = getDatabase();
const ORN_REF = ref(db, "ornaments_shared");

/* ===========================
   DOM references (best-effort)
   =========================== */
const stage = document.getElementById("stage") || document.getElementById("tree-container") || document.querySelector("#tree-container") || document.body;
const decorateLayer = document.getElementById("decorate-layer") || document.getElementById("decorate-layer") || (stage.querySelector && stage.querySelector("#decorate-layer")) || stage;
const tray = document.getElementById("ornament-tray") || document.querySelector("#ornament-tray");
const saveBtn = document.getElementById("save-btn");
const themeToggle = document.getElementById("theme-toggle");

/* safe guards */
if (!stage) console.warn("script.js: no #stage element found; script expects an element with id='stage' or 'tree-container'");
if (!decorateLayer) console.warn("script.js: no #decorate-layer element found; placed ornaments will be appended to stage");

/* ===========================
   Helpers
   =========================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = (p='o') => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

/* convert pixel coords relative to stage rect -> percentage (0-100) */
function pxToPct(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

/* convert pct coords -> pixel positions (for style.left/top) */
function pctToPx(xPct, yPct) {
  const rect = stage.getBoundingClientRect();
  return { left: (xPct / 100) * rect.width, top: (yPct / 100) * rect.height };
}

/* simple debounce keyed by id */
const debounceMap = new Map();
function debounce(id, fn, ms = 200) {
  if (debounceMap.has(id)) clearTimeout(debounceMap.get(id));
  debounceMap.set(id, setTimeout(() => { debounceMap.delete(id); fn(); }, ms));
}

/* save model to firebase (debounced per model) */
function saveModelDebounced(model) {
  debounce(model.id, () => {
    set(ref(db, `ornaments_shared/${model.id}`), model).catch(e => console.warn("save failed", e));
  }, 220);
}

/* delete model in firebase */
function deleteModel(modelId) {
  set(ref(db, `ornaments_shared/${modelId}`), null).catch(e => console.warn("delete failed", e));
}

/* map type -> filename */
const SOURCE = {
  star: "star.png",
  red: "bauble-red.png",
  blue: "bauble-blue.png",
  candy: "candy.png",
  bell: "bell.png",
  ginger: "ginger.png",
  present: "present.png"
};

/* ===========================
   Render / update element
   =========================== */
function createOrGetElement(model) {
  let el = document.getElementById(model.id);
  if (el) return el;

  el = document.createElement("img");
  el.id = model.id;
  el.draggable = false; // we'll use pointer events
  el.className = "placed-ornament";
  el.alt = model.type || "orn";
  el.style.position = "absolute";
  el.style.touchAction = "none";
  (decorateLayer || stage).appendChild(el);

  attachPointerControls(el, model);
  return el;
}

function renderOrnament(model) {
  // store model attributes defaults
  model.scale = model.scale ?? 1;
  model.rotation = model.rotation ?? 0;
  model.type = model.type ?? "bell";

  const el = createOrGetElement(model);
  el.src = `ornaments/${SOURCE[model.type] || SOURCE['bell']}`;

  // position using pct -> px so it lines up visually
  const px = pctToPx(model.x, model.y);
  el.style.left = px.left + "px";
  el.style.top  = px.top + "px";
  el.style.transform = `translate(-50%,-50%) scale(${model.scale}) rotate(${model.rotation}deg)`;
}

/* remove */
function removeOrnamentById(id) {
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* ===========================
   Tap-to-add (touch friendly)
   =========================== */
if (tray) {
  tray.querySelectorAll(".ornament-template, .ornament-btn, img").forEach(button => {
    // prefer data-type attribute; fallback to filename mapping by src
    const type = button.dataset && button.dataset.type ? button.dataset.type : null;
    button.addEventListener("click", (ev) => {
      const chosenType = type || inferTypeFromSrc(button.src);
      // center of stage by default (in pct)
      const rect = stage.getBoundingClientRect();
      const xPct = 50; // center
      const yPct = 45;
      const id = uid('orn_');
      const model = { id, type: chosenType, x: xPct, y: yPct, scale: 0.05, rotation: 0 };
      // write to firebase
      set(ref(db, `ornaments_shared/${id}`), model).catch(e => console.warn(e));
    });
  });
}

function inferTypeFromSrc(src) {
  if (!src) return 'bell';
  src = src.toLowerCase();
  if (src.includes("star")) return "star";
  if (src.includes("red")) return "red";
  if (src.includes("blue")) return "blue";
  if (src.includes("candy")) return "candy";
  if (src.includes("bell")) return "bell";
  if (src.includes("ginger")) return "ginger";
  if (src.includes("present")) return "present";
  return "bell";
}

/* ===========================
   Pointer controls - drag, pinch, rotate, long-press delete
   Works with pointer events (touch & mouse)
   =========================== */
function attachPointerControls(el, model) {
  // track active pointers
  const pointers = new Map();
  let start = {}; // will contain start positions and metrics
  let isDragging = false;
  let delTimer = null;
  let movedSinceDown = false;

  // helper: update element visual based on model (pct coords)
  function updateElementVisual() {
    const px = pctToPx(model.x, model.y);
    el.style.left = px.left + "px";
    el.style.top  = px.top + "px";
    el.style.transform = `translate(-50%,-50%) scale(${model.scale}) rotate(${model.rotation}deg)`;
  }

  // pointerdown
  el.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    el.setPointerCapture(ev.pointerId);
    pointers.set(ev.pointerId, ev);

    // for long-press delete: start timer, cancel on move
    movedSinceDown = false;
    delTimer = setTimeout(() => {
      // if not moved, delete
      if (!movedSinceDown) {
        deleteModel(model.id);
      }
    }, 700);

    if (pointers.size === 1) {
      const p = ev;
      const rect = stage.getBoundingClientRect();
      start.clientX = p.clientX;
      start.clientY = p.clientY;
      start.modelX = model.x;
      start.modelY = model.y;
      start.rect = rect;
      isDragging = true;
    } else if (pointers.size === 2) {
      // initialize pinch/rotate
      const [a, b] = Array.from(pointers.values());
      start.dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      start.angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;
      start.scale = model.scale ?? 1;
      start.rotation = model.rotation ?? 0;
      isDragging = false;
    }
  });

  // pointermove
  window.addEventListener("pointermove", (ev) => {
    if (!pointers.size) return;
    if (!pointers.has(ev.pointerId)) return;
    pointers.set(ev.pointerId, ev);
    movedSinceDown = true;
    if (delTimer) { clearTimeout(delTimer); delTimer = null; }

    const rect = stage.getBoundingClientRect();

    if (pointers.size === 1) {
      // single-finger drag -> move in pct
      const p = Array.from(pointers.values())[0];
      const dx = (p.clientX - start.clientX) / rect.width * 100;
      const dy = (p.clientY - start.clientY) / rect.height * 100;
      model.x = clamp(start.modelX + dx, 0, 100);
      model.y = clamp(start.modelY + dy, 0, 100);
      updateElementVisual();
      saveModelDebounced(model);
    } else if (pointers.size === 2) {
      // pinch/rotate using two pointers
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      const angle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180 / Math.PI;

      // scale multiplier
const newScale = clamp(start.scale * (dist / start.dist), 0.05, 3.0);
model.scale = newScale;

    
      // rotation relative to start
      model.rotation = (start.rotation ?? 0) + (angle - start.angle);

      updateElementVisual();
      saveModelDebounced(model);
    }
  }, { passive: false });

  // pointerup / cancel
  function pointerEnd(ev) {
    if (pointers.has(ev.pointerId)) pointers.delete(ev.pointerId);
    if (delTimer) { clearTimeout(delTimer); delTimer = null; }
    // final save
    saveModelDebounced(model);
  }
  window.addEventListener("pointerup", pointerEnd);
  window.addEventListener("pointercancel", pointerEnd);
}

/* ===========================
   Firebase realtime listeners
   =========================== */
onChildAdded(ORN_REF, snap => {
  const model = snap.val();
  if (!model || !model.id) return;
  // ensure model.x/y exist and are pct numbers
  model.x = Number(model.x ?? 50);
  model.y = Number(model.y ?? 45);
  model.scale = Number(model.scale ?? 1);
  model.rotation = Number(model.rotation ?? 0);
  renderOrnament(model);
});

onChildChanged(ORN_REF, snap => {
  const model = snap.val();
  if (!model || !model.id) return;
  renderOrnament(model);
});

onChildRemoved(ORN_REF, snap => {
  const key = snap.key;
  if (!key) return;
  removeOrnamentById(key);
});


/* ===========================
   Theme toggle (if present)
   =========================== */
if (themeToggle) {
  // toggle 'night' class on body
  themeToggle.addEventListener("change", () => {
    document.documentElement.dataset.theme = themeToggle.checked ? 'dark' : 'light';
    localStorage.setItem('theme', document.documentElement.dataset.theme);
  });
  // apply saved
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.dataset.theme = saved;
    try { themeToggle.checked = saved === 'dark'; } catch {}
  }
}

/* ===========================
   Helpful: when window resizes, re-render all elements to align px positions
   =========================== */
window.addEventListener("resize", () => {
  // iterate all placed elements and re-render from their stored model (firebase entries)
  // we assume DOM elements have id equal to firebase model.id and attached transform
  // For correctness, request current data from DOM element dataset where possible
  // We'll attempt to convert current left/top pct values back to px positions
  document.querySelectorAll(".placed-ornament").forEach(el => {
    // if element has inline left/top in px, keep it; if it has model values we rendered earlier they are applied
    // simply re-apply transform using current computed pct from style left/top if percent->px mismatch
    const id = el.id;
    if (!id) return;
    // nothing heavy here; rendering is driven by firebase updates in real-time
  });
});

/* ===========================
   Done
   =========================== */
console.log("script.js loaded — percent coordinate mode enabled (Option A).");
