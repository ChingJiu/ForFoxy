// script.js
// Hybrid (Firebase real-time + free drag-out-to-trash) implementation
// Load as: <script type="module" src="script.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, set, remove,
  onChildAdded, onChildChanged, onChildRemoved
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ===========================
   Firebase config - replace if needed
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

initializeApp(firebaseConfig);
const db = getDatabase();
const ORN_REF = ref(db, "ornaments_shared");

/* ===========================
   DOM references
   =========================== */
const stage = document.getElementById("stage");                 // visible stage (container)
const decorateLayer = document.getElementById("decorate-layer") || stage; // where ornaments visually live
const tray = document.getElementById("ornament-tray");
const trash = document.getElementById("trash-zone");
const themeToggle = document.getElementById("theme-toggle");
const saveBtn = document.getElementById("save-btn");
const lastEdit = document.getElementById("last-edit-date");

/* quick checks */
if (!stage) console.warn("script.js: #stage not found (expected).");
if (!decorateLayer) console.warn("script.js: #decorate-layer not found; falling back to stage.");

/* ===========================
   Utilities
   =========================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = (p='o') => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

function pxToPct(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
}

function pctToPx(xPct, yPct) {
  const rect = stage.getBoundingClientRect();
  return { left: (xPct / 100) * rect.width, top: (yPct / 100) * rect.height };
}

/* debounce per id */
const debounceMap = new Map();
function debounce(id, fn, ms = 180) {
  if (debounceMap.has(id)) clearTimeout(debounceMap.get(id));
  debounceMap.set(id, setTimeout(() => { debounceMap.delete(id); fn(); }, ms));
}
function saveModelDebounced(model) {
  debounce(model.id, () => {
    set(ref(db, `ornaments_shared/${model.id}`), model).catch(e => console.warn("save failed", e));
  }, 200);
}
function saveModelImmediate(model) {
  set(ref(db, `ornaments_shared/${model.id}`), model).catch(e => console.warn("save failed", e));
}
function deleteModel(modelId) {
  remove(ref(db, `ornaments_shared/${modelId}`)).catch(e => console.warn("delete failed", e));
}

/* source map */
const SOURCE = {
  star: "star.png",
  red: "bauble-red.png",
  blue: "bauble-blue.png",
  candy: "candy.png",
  bell: "bell.png",
  ginger: "ginger.png",
  present: "present.png",
  cat: "cat.png"
};

/* ===========================
   Render / element lifecycle
   =========================== */
function createOrGetElement(model) {
  let el = document.getElementById(model.id);
  if (el) return el;

  el = document.createElement("img");
  el.id = model.id;
  el.draggable = false;
  el.className = "placed-ornament";
  el.alt = model.type || "orn";
  el.style.position = "absolute";
  el.style.touchAction = "none";
  el.style.transformOrigin = "50% 50%";
  (decorateLayer || stage).appendChild(el);

  // attach pointer controls which handle dragging/pinch/rotate
  attachPointerControls(el, model);

  return el;
}

function renderOrnament(model) {
  if (!model || !model.id) return;
  // normalize model
  model.x = Number(model.x ?? 50);
  model.y = Number(model.y ?? 45);
  model.scale = Number(model.scale ?? 0.6);
  model.rotation = Number(model.rotation ?? 0);
  model.type = model.type ?? "bell";

  const el = createOrGetElement(model);
  el.src = `ornaments/${SOURCE[model.type] || SOURCE['bell']}`;

  // compute px placement and apply sizing via width baseline * scale
  const px = pctToPx(model.x, model.y);
  el.style.left = px.left + "px";
  el.style.top = px.top + "px";
  el.style.width = Math.round(46 * model.scale) + "px"; // base 46px * scale (adjustable)
  el.style.height = "auto";
  el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
  el._model = model;
}

function removeOrnamentById(id) {
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* ===========================
   Tap-to-add (touch friendly)
   =========================== */
if (tray) {
  tray.querySelectorAll(".ornament-template").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type || inferTypeFromSrc(btn.src);
      const id = uid('orn_');
      // center in stage pct
      const model = { id, type, x: 50, y: 45, scale: 0.6, rotation: 0 };
      saveModelImmediate(model);
    });
  });
}
function inferTypeFromSrc(src) {
  if (!src) return 'bell';
  const s = src.toLowerCase();
  if (s.includes("star")) return "star";
  if (s.includes("red")) return "red";
  if (s.includes("blue")) return "blue";
  if (s.includes("candy")) return "candy";
  if (s.includes("bell")) return "bell";
  if (s.includes("ginger")) return "ginger";
  if (s.includes("present")) return "present";
  if (s.includes("cat")) return "cat";
  return "bell";
}

/* ===========================
   Trash helpers
   =========================== */
function isElementOverTrash(el) {
  if (!trash) return false;
  const tr = trash.getBoundingClientRect();
  const er = el.getBoundingClientRect();
  const cx = er.left + er.width/2;
  const cy = er.top  + er.height/2;
  return cx >= tr.left && cx <= tr.right && cy >= tr.top && cy <= tr.bottom;
}
function applyTrashVisual(el, near) {
  if (near) {
    el.classList.add("near-trash"); // your CSS shrink + wiggle class
    if (trash) trash.classList.add("active");
  } else {
    el.classList.remove("near-trash");
    if (trash) trash.classList.remove("active");
  }
}

/* ===========================
   Pointer controls (hybrid)
   - while dragging, element becomes fixed to document.body (so it can go to trash)
   - on release: if over trash -> delete; else compute pct relative to stage and save to Firebase
   - supports pinch-to-scale and rotate (2 pointers)
   =========================== */
function attachPointerControls(el, model) {
  // maintain local model reference
  el._model = model;

  const pointers = new Map();
  let start = {};
  let startScale = model.scale ?? 0.6;
  let startRotation = model.rotation ?? 0;
  let dragging = false;
  let moved = false;

  // helper to update visuals from model (pct coords)
  function applyVisual() {
    const px = pctToPx(model.x, model.y);
    el.style.left = px.left + "px";
    el.style.top = px.top + "px";
    el.style.width = Math.round(46 * model.scale) + "px";
    el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
  }

  // helper to move element to document.body as fixed-position during dragging
  function placeElementAsFixedFromCurrent(el) {
    // compute current bounding rect and convert left/top to page px
    const rect = el.getBoundingClientRect();
    el.style.position = "fixed";
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style.zIndex = 9999;
    // remove from decorateLayer and ensure it's child of body (so it can move freely)
    if (el.parentElement !== document.body) document.body.appendChild(el);
  }

  // and return it back to relative placement inside decorateLayer after finalizing
  function returnElementToLayer(el, model) {
    // convert current fixed left/top px into percentage relative to stage
    const rect = stage.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    // center point of the ornament
    const centerX = elRect.left + elRect.width/2;
    const centerY = elRect.top + elRect.height/2;
    const xPct = clamp(((centerX - rect.left) / rect.width) * 100, 0, 100);
    const yPct = clamp(((centerY - rect.top) / rect.height) * 100, 0, 100);
    model.x = xPct;
    model.y = yPct;
    // append back into decorateLayer for consistent DOM hierarchy
    if (decorateLayer && el.parentElement !== decorateLayer) decorateLayer.appendChild(el);
    el.style.position = "absolute";
    el.style.left = pctToPx(model.x, model.y).left + "px";
    el.style.top = pctToPx(model.x, model.y).top + "px";
    el.style.zIndex = "";
    el.style.width = Math.round(46 * model.scale) + "px";
    el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
  }

  // pointerdown on element
  el.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    // capture pointer locally
    el.setPointerCapture?.(ev.pointerId);
    pointers.set(ev.pointerId, ev);
    moved = false;

    // if first pointer, remember start client coords and model pct
    if (pointers.size === 1) {
      const p = ev;
      start.clientX = p.clientX;
      start.clientY = p.clientY;
      start.modelX = model.x;
      start.modelY = model.y;
      start.rect = stage.getBoundingClientRect();
      // prepare to drag: place element as fixed so it can move to trash area outside decorateLayer
      placeElementAsFixedFromCurrent(el);
      dragging = true;
    } else if (pointers.size === 2) {
      // pinch start: compute initial distance & angle
      const [a, b] = Array.from(pointers.values());
      start.dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      start.angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * (180/Math.PI);
      startScale = model.scale ?? startScale;
      startRotation = model.rotation ?? startRotation;
    }
  });

  // pointermove on window (so pointer works outside original container)
  window.addEventListener("pointermove", (ev) => {
    if (!pointers.size) return;
    if (!pointers.has(ev.pointerId)) return;
    pointers.set(ev.pointerId, ev);
    moved = true;

    // prevent scrolling on touch during manipulation
    if (ev.pointerType === 'touch') ev.preventDefault?.();

    // single pointer = translate
    if (pointers.size === 1) {
      const p = Array.from(pointers.values())[0];
      const dxPx = p.clientX - start.clientX;
      const dyPx = p.clientY - start.clientY;
      // stage rect for pct conversion
      const rect = stage.getBoundingClientRect();
      // convert delta px to percent
      const dxPct = (dxPx / rect.width) * 100;
      const dyPct = (dyPx / rect.height) * 100;
      model.x = clamp(start.modelX + dxPct, 0, 100);
      model.y = clamp(start.modelY + dyPct, 0, 100);
      // while dragging, update fixed-position left/top directly (px)
      // compute pixel placement of model center relative to page
      const px = pctToPx(model.x, model.y);
      // px.left/top are relative to stage; convert to page px by adding stage.left/top
      const stageRect = rect;
      const pageLeft = stageRect.left + px.left;
      const pageTop  = stageRect.top  + px.top;
      el.style.left = pageLeft - (el.getBoundingClientRect().width/2) + "px";
      el.style.top  = pageTop  - (el.getBoundingClientRect().height/2) + "px";
      // shrink / wiggle visual if near trash
      applyTrashVisual(el, isElementOverTrash(el));
      // live debounce save
      saveModelDebounced(model);
    }

    // two pointers = pinch / rotate
    if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      const angle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * (180/Math.PI);
      const newScale = clamp(startScale * (dist / start.dist), 0.35, 3.5);
      model.scale = newScale;
      model.rotation = startRotation + (angle - start.angle);
      // update element sizing while fixed
      el.style.width = Math.round(46 * model.scale) + "px";
      el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
      saveModelDebounced(model);
      applyTrashVisual(el, isElementOverTrash(el));
    }
  }, { passive: false });

  // pointerup/cancel handling
  const onPointerEnd = (ev) => {
    if (pointers.has(ev.pointerId)) pointers.delete(ev.pointerId);
    // drop behavior only after last pointer lifts
    if (pointers.size === 0) {
      // if currently over trash -> delete
      if (isElementOverTrash(el)) {
        // small wiggle animation class then delete
        el.classList.add("will-delete");
        setTimeout(() => {
          deleteModel(model.id);
          removeOrnamentById(model.id);
        }, 260);
      } else {
        // else finalize position: convert px center -> pct inside stage, save, and return element to decorateLayer
        returnElementToLayer(el, model);
        saveModelImmediate(model);
        applyTrashVisual(el, false);
      }
      // reset dragging flags
      dragging = false;
      moved = false;
    }
  };

  window.addEventListener("pointerup", onPointerEnd);
  window.addEventListener("pointercancel", onPointerEnd);
}

/* ===========================
   Firebase realtime listeners
   =========================== */
onChildAdded(ORN_REF, snap => {
  const model = snap.val();
  if (!model || !model.id) return;
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
   Theme toggle wiring
   - expects an input (checkbox) #theme-toggle
   - uses dataset.theme='dark'|'light'
   =========================== */
if (themeToggle) {
  const saved = localStorage.getItem('theme') || document.documentElement.dataset.theme || 'light';
  document.documentElement.dataset.theme = saved;
  try { themeToggle.checked = (saved === 'dark'); } catch (e) {}
  themeToggle.addEventListener('change', (e) => {
    const dark = !!e.target.checked;
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });
}

/* ===========================
   Optional: save screenshot if #save-btn present
   =========================== */
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    try {
      const { default: html2canvas } = await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js");
      const canvas = await html2canvas(stage, { backgroundColor: null, scale: 2 });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'tree-snapshot.png';
      a.click();
    } catch (err) {
      console.warn('screenshot failed', err);
      alert('Screenshot failed (see console).');
    }
  });
}

/* ===========================
   Last edited date
   =========================== */
if (lastEdit) lastEdit.textContent = new Date().toLocaleDateString();

/* ===========================
   End
   =========================== */
console.log("script.js — hybrid drag/pinch/trash + Firebase wired.");
