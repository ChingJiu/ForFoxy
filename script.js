// script.js
// load with: <script type="module" src="script.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onChildAdded,
  onChildChanged,
  onChildRemoved
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

/* ===========================
   FIREBASE CONFIG
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
   DOM refs
   =========================== */
const stage = document.getElementById("stage");
const decorateLayer = document.getElementById("decorate-layer") || stage;
const tray = document.getElementById("ornament-tray");
const trashZone = document.getElementById("trash-zone");
const themeToggle = document.getElementById("theme-toggle");
const lastEdit = document.getElementById("last-edit-date");

/* quick safety */
if (!stage) console.warn("No #stage element found");
if (!decorateLayer) console.warn("No #decorate-layer; defaulting to stage");

/* ===========================
   Helpers
   =========================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = (p = "o") => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

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

const debounceMap = new Map();
function debounce(id, fn, ms = 200) {
  if (debounceMap.has(id)) clearTimeout(debounceMap.get(id));
  debounceMap.set(id, setTimeout(() => { debounceMap.delete(id); fn(); }, ms));
}

function saveModelDebounced(model) {
  debounce(model.id, () => {
    set(ref(db, `ornaments_shared/${model.id}`), model).catch(e => console.warn("save failed", e));
  }, 200);
}

function deleteModel(modelId) {
  set(ref(db, `ornaments_shared/${modelId}`), null).catch(e => console.warn("delete failed", e));
}

/* map type -> file */
const SOURCE = {
  star: "star.png",
  red: "bauble-red.png",
  blue: "bauble-blue.png",
  candy: "candy.png",
  bell: "bell.png",
  ginger: "ginger.png",
  present: "present.png",
  cat: "cat.png",
  wdzy: "wdzy.png"
};

/* ===========================
   Render / update ornaments
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

  attachPointerControls(el, model);
  return el;
}

function renderOrnament(model) {
  if (!model || !model.id) return;
  model.scale = Number(model.scale ?? 0.6);   // default smaller so not huge
  model.rotation = Number(model.rotation ?? 0);
  model.type = model.type ?? "bell";
  model.x = Number(model.x ?? 50);
  model.y = Number(model.y ?? 45);

  const el = createOrGetElement(model);
  el.src = `ornaments/${SOURCE[model.type] || SOURCE['bell']}`;

  // ensure visually consistent sizing: apply a CSS width via scale baseline.
  // Use pct -> px to place element accurately
  const px = pctToPx(model.x, model.y);
  el.style.left = px.left + "px";
  el.style.top = px.top + "px";
  el.style.width = Math.round(48 * model.scale) + "px"; // base width 48px * scale
  el.style.height = "auto";
  el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
  // store current model on element for quick access
  el._model = model;
}

function removeOrnamentById(id) {
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* ===========================
   Tap to add (tray)
   =========================== */
if (tray) {
  tray.querySelectorAll(".ornament-template").forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type || inferTypeFromSrc(btn.src);
      // default center placement in pct
      const xPct = 50;
      const yPct = 45;
      const id = uid("orn_");
      const model = { id, type, x: xPct, y: yPct, scale: 0.6, rotation: 0 };
      set(ref(db, `ornaments_shared/${id}`), model).catch(e => console.warn(e));
    });
  });
}

function inferTypeFromSrc(src) {
  if (!src) return "bell";
  const s = src.toLowerCase();
  if (s.includes("star")) return "star";
  if (s.includes("red")) return "red";
  if (s.includes("blue")) return "blue";
  if (s.includes("candy")) return "candy";
  if (s.includes("bell")) return "bell";
  if (s.includes("ginger")) return "ginger";
  if (s.includes("present")) return "present";
  if (s.includes("cat")) return "cat";
  if (s.includes("wdzy")) return "wdzy";
  return "bell";
}

/* ===========================
   Trash helpers
   =========================== */
function isElementOverTrash(el) {
  if (!trashZone) return false;
  const trashRect = trashZone.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const cx = elRect.left + elRect.width / 2;
  const cy = elRect.top + elRect.height / 2;
  return cx >= trashRect.left && cx <= trashRect.right && cy >= trashRect.top && cy <= trashRect.bottom;
}

function applyTrashHoverVisual(el, isHovering) {
  if (isHovering) {
    el.classList.add("near-trash");
  } else {
    el.classList.remove("near-trash");
  }
}

/* ===========================
   Pointer controls - drag, pinch, rotate, drop-to-trash
   Works with pointer events on iPad & desktop
   =========================== */
function attachPointerControls(el, model) {
  const pointers = new Map();
  let start = {};
  let startScale = model.scale ?? 0.6;
  let startRotation = model.rotation ?? 0;
  let moved = false;

  // ensure element size updates when scale changes
  function updateVisual() {
    const px = pctToPx(model.x, model.y);
    el.style.left = px.left + "px";
    el.style.top = px.top + "px";
    el.style.width = Math.round(48 * model.scale) + "px";
    el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
    el._model = model;
  }

  el.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    el.setPointerCapture?.(ev.pointerId);
    pointers.set(ev.pointerId, ev);
    moved = false;

    if (pointers.size === 1) {
      // store start positions (pct)
      const p = ev;
      const rect = stage.getBoundingClientRect();
      start.clientX = p.clientX;
      start.clientY = p.clientY;
      start.modelX = model.x;
      start.modelY = model.y;
    } else if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      start.dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      start.angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;
      startScale = model.scale ?? startScale;
      startRotation = model.rotation ?? startRotation;
    }
  });

  // pointermove on window so dragging stays responsive
  window.addEventListener("pointermove", (ev) => {
    if (!pointers.size) return;
    if (!pointers.has(ev.pointerId)) return;
    pointers.set(ev.pointerId, ev);
    moved = true;

    const rect = stage.getBoundingClientRect();

    if (pointers.size === 1) {
      // move — convert px delta to percentage
      const p = Array.from(pointers.values())[0];
      const dxPct = ((p.clientX - start.clientX) / rect.width) * 100;
      const dyPct = ((p.clientY - start.clientY) / rect.height) * 100;
      model.x = clamp(start.modelX + dxPct, 0, 100);
      model.y = clamp(start.modelY + dyPct, 0, 100);

      updateVisual();

      // show shrink / wiggle when near trash
      const near = isElementOverTrash(el);
      applyTrashHoverVisual(el, near);
    }

    if (pointers.size === 2) {
      // pinch/rotate
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      const angle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180 / Math.PI;

      // scale relative to start
      const newScale = clamp(startScale * (dist / start.dist), 0.5, 2.5); // smaller min
      model.scale = newScale;

      // rotation relative
      model.rotation = startRotation + (angle - start.angle);

      updateVisual();
    }
  }, { passive: false });

  function pointerUpHandler(ev) {
    if (pointers.has(ev.pointerId)) pointers.delete(ev.pointerId);

    // If dropped while over trash, delete
    if (isElementOverTrash(el)) {
      // visual: wiggle before remove then delete
      el.classList.add("will-delete");
      setTimeout(() => {
        deleteModel(model.id);
        removeOrnamentById(model.id);
      }, 240); // short wiggle duration
      return;
    }

    // otherwise save final model
    saveModelDebounced(model);
    applyTrashHoverVisual(el, false);
  }

  window.addEventListener("pointerup", pointerUpHandler);
  window.addEventListener("pointercancel", pointerUpHandler);
}

/* ===========================
   Realtime Firebase listeners
   =========================== */
onChildAdded(ORN_REF, snap => {
  const model = snap.val();
  if (!model || !model.id) return;
  model.x = Number(model.x ?? 50);
  model.y = Number(model.y ?? 45);
  model.scale = Number(model.scale ?? 0.6);
  model.rotation = Number(model.rotation ?? 0);
  renderOrnament(model);
});

onChildChanged(ORN_REF, snap => {
  const model = snap.val();
  if (!model || !model.id) return;
  // If element exists, update it's model and visuals
  const el = document.getElementById(model.id);
  if (el) {
    // update stored model and recolor/resize
    el._model = model;
    model.scale = Number(model.scale ?? 0.6);
    model.rotation = Number(model.rotation ?? 0);
    model.x = Number(model.x ?? 50);
    model.y = Number(model.y ?? 45);

    // apply visuals
    const px = pctToPx(model.x, model.y);
    el.style.left = px.left + "px";
    el.style.top = px.top + "px";
    el.style.width = Math.round(48 * model.scale) + "px";
    el.style.transform = `translate(-50%,-50%) rotate(${model.rotation}deg)`;
  } else {
    // not present — render fresh
    renderOrnament(model);
  }
});

onChildRemoved(ORN_REF, snap => {
  const key = snap.key;
  if (!key) return;
  removeOrnamentById(key);
});

/* ===========================
   Theme toggle wiring
   =========================== */
if (themeToggle) {
  // initial apply from localStorage
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.documentElement.dataset.theme = "dark";
    themeToggle.checked = true;
  } else {
    document.documentElement.dataset.theme = "light";
    themeToggle.checked = false;
  }

  themeToggle.addEventListener("change", () => {
    const dark = themeToggle.checked;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}

/* ===========================
   Footer date
   =========================== */
if (lastEdit) lastEdit.textContent = new Date().toLocaleDateString();

/* ===========================
   Done
   =========================== */
console.log("script.js loaded — drag/pinch/delete-on-drop wired.");
