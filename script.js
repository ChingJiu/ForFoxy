// script.js
// Use with: <script type="module" src="script.js"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase, ref, set,
  onChildAdded, onChildChanged, onChildRemoved
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
const stage = document.getElementById("stage") || document.getElementById("tree-container") || document.body;
const decorateLayer = document.getElementById("decorate-layer") || stage;
const tray = document.getElementById("ornament-tray");
const saveBtn = document.getElementById("save-btn");
const themeToggle = document.getElementById("theme-toggle");
const trashZone = document.getElementById("trash-zone");

/* ===========================
   Configuration
   =========================== */
const DEFAULT_SCALE = 0.8;   // default when adding (smaller than before)
const MIN_SCALE = 0.9;       // smallest allowed (now small but visible)
const MAX_SCALE = 2.5;        // largest allowed
const TRASH_HOLD_MS = 500;    // how long over trash before wiggle+delete
const SAVE_DEBOUNCE = 220;

/* ===========================
   Helpers
   =========================== */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = (p='o') => p + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

function pxToPct(clientX, clientY) {
  const rect = stage.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  return { x, y };
}

function pctToPx(xPct, yPct) {
  const rect = stage.getBoundingClientRect();
  return { left: (xPct / 100) * rect.width, top: (yPct / 100) * rect.height };
}

const debounceMap = new Map();
function debounce(id, fn, ms = SAVE_DEBOUNCE) {
  if (debounceMap.has(id)) clearTimeout(debounceMap.get(id));
  debounceMap.set(id, setTimeout(() => { debounceMap.delete(id); fn(); }, ms));
}

function saveModelDebounced(model) {
  debounce(model.id, () => {
    // clamp before saving so DB keeps sane values
    model.x = Number(clamp(Number(model.x || 0), 0, 100));
    model.y = Number(clamp(Number(model.y || 0), 0, 100));
    model.scale = Number(clamp(Number(model.scale || 1), MIN_SCALE, MAX_SCALE));
    model.rotation = Number(model.rotation || 0);
    set(ref(db, `ornaments_shared/${model.id}`), model).catch(e => console.warn("save failed", e));
  }, SAVE_DEBOUNCE);
}

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
  present: "present.png",
  cat: "cat.png"
};

/* ===========================
   Render / update element
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
  el.style.willChange = "transform, left, top";
  (decorateLayer || stage).appendChild(el);

  attachPointerControls(el, model);
  return el;
}

function renderOrnament(model) {
  // fill defaults
  model.scale = Number(model.scale ?? DEFAULT_SCALE);
  model.rotation = Number(model.rotation ?? 0);
  model.type = model.type ?? "bell";
  model.x = Number(model.x ?? 50);
  model.y = Number(model.y ?? 45);

  const el = createOrGetElement(model);
  el.src = `ornaments/${SOURCE[model.type] || SOURCE['bell']}`;

  // set size visually by CSS transform and ensure image natural size doesn't overflow:
  // Use pct->px so when stage resizes the visual position remains consistent.
  const px = pctToPx(model.x, model.y);
  el.style.left = px.left + "px";
  el.style.top = px.top + "px";
  el.style.transform = `translate(-50%,-50%) scale(${model.scale}) rotate(${model.rotation}deg)`;
  el.dataset.model = JSON.stringify(model);
}

function removeOrnamentById(id) {
  const el = document.getElementById(id);
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/* ===========================
   Tap-to-add (touch friendly)
   =========================== */
if (tray) {
  tray.querySelectorAll(".ornament-template, img").forEach(button => {
    const type = button.dataset && button.dataset.type ? button.dataset.type : inferTypeFromSrc(button.src);
    button.addEventListener("click", (ev) => {
      const id = uid('orn_');
      const model = {
        id,
        type,
        x: 50,       // center in pct
        y: 45,
        scale: DEFAULT_SCALE,
        rotation: 0
      };
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
  if (src.includes("ginger")) return "ginger";
  if (src.includes("present")) return "present";
  if (src.includes("bell")) return "bell";
  return "bell";
}

/* ===========================
   Trash helpers
   =========================== */
function isOverTrashByCenter(el) {
  if (!trashZone) return false;
  const trashRect = trashZone.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const cx = elRect.left + elRect.width / 2;
  const cy = elRect.top + elRect.height / 2;
  return cx >= trashRect.left && cx <= trashRect.right && cy >= trashRect.top && cy <= trashRect.bottom;
}

/* ===========================
   Pointer controls (drag, pinch, rotate, trash)
   Works with pointer events (touch & mouse)
   =========================== */
function attachPointerControls(el, model) {
  // per-element state
  const pointers = new Map();
  let start = {};
  let trashTimer = null;
  let inTrash = false;

  // convenience to sync model -> visual
  function updateElementVisual() {
    const px = pctToPx(model.x, model.y);
    el.style.left = px.left + "px";
    el.style.top = px.top + "px";
    el.style.transform = `translate(-50%,-50%) scale(${model.scale}) rotate(${model.rotation}deg)`;
  }

  // handle pointerdown on the ornament
  el.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    el.setPointerCapture?.(ev.pointerId);
    pointers.set(ev.pointerId, ev);

    // store starting metrics
    if (pointers.size === 1) {
      const p = ev;
      const rect = stage.getBoundingClientRect();
      start.clientX = p.clientX;
      start.clientY = p.clientY;
      start.modelX = model.x;
      start.modelY = model.y;
      start.rect = rect;
    } else if (pointers.size === 2) {
      const [a, b] = Array.from(pointers.values());
      start.dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
      start.angle = Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;
      start.scale = model.scale;
      start.rotation = model.rotation;
    }

    // remove any previous classes
    el.classList.remove("near-trash", "wiggle");
  });

  // pointermove - we listen globally on window to allow moving outside the stage
  window.addEventListener("pointermove", (ev) => {
    if (!pointers.size) return;
    if (!pointers.has(ev.pointerId)) return;
    // update this pointer's latest event
    pointers.set(ev.pointerId, ev);

    // convert to stage rect for percent calculations
    const rect = stage.getBoundingClientRect();

    if (pointers.size === 1) {
      // single pointer => drag: compute delta in pct so persistent model is pct-based
      const p = Array.from(pointers.values())[0];
      const dxPct = ((p.clientX - start.clientX) / rect.width) * 100;
      const dyPct = ((p.clientY - start.clientY) / rect.height) * 100;

      // allow movement beyond 0..100 while dragging (so user can move to trash)
      model.x = start.modelX + dxPct;
      model.y = start.modelY + dyPct;

      // update visual
      updateElementVisual();

      // trash detection (by screen center of element) -> shrink/near-trash
      if (isOverTrashByCenter(el)) {
        if (!inTrash) {
          inTrash = true;
          el.classList.add("near-trash");
          // start timer that will wiggle then delete if held inside trash
          trashTimer = setTimeout(() => {
            el.classList.add("wiggle");
            // short delay to show wiggle, then delete (if still over trash)
            setTimeout(() => {
              if (isOverTrashByCenter(el)) {
                deleteModel(model.id);
                removeOrnamentById(model.id);
              } else {
                el.classList.remove("wiggle");
              }
            }, 350);
          }, TRASH_HOLD_MS);
        }
      } else {
        // left trash area
        inTrash = false;
        el.classList.remove("near-trash");
        el.classList.remove("wiggle");
        if (trashTimer) { clearTimeout(trashTimer); trashTimer = null; }
      }

      // live save but debounced
      saveModelDebounced(model);
    } else if (pointers.size === 2) {
      // pinch/rotate
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.clientX - p1.clientX, p2.clientY - p1.clientY);
      const angle = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX) * 180 / Math.PI;

      const newScale = clamp((start.scale || 1) * (dist / (start.dist || dist)), MIN_SCALE, MAX_SCALE);
      model.scale = newScale;
      model.rotation = (start.rotation || 0) + (angle - (start.angle || 0));

      updateElementVisual();
      saveModelDebounced(model);

      // if gesture moves the element center to trash, handle similar to above:
      if (isOverTrashByCenter(el)) {
        el.classList.add("near-trash");
      } else {
        el.classList.remove("near-trash");
      }
    }
  }, { passive: false });

  // pointerup / cancel: remove pointer and finalize
  function finalizePointer(ev) {
    if (pointers.has(ev.pointerId)) pointers.delete(ev.pointerId);

    // if currently over trash on release -> delete
    if (isOverTrashByCenter(el)) {
      deleteModel(model.id);
      removeOrnamentById(model.id);
      if (trashTimer) { clearTimeout(trashTimer); trashTimer = null; }
      return;
    }

    // clean up any temporary classes
    el.classList.remove("near-trash", "wiggle");
    if (trashTimer) { clearTimeout(trashTimer); trashTimer = null; }
    // clamp model to safe range and persist
    model.x = clamp(Number(model.x ?? 0), 0, 100);
    model.y = clamp(Number(model.y ?? 0), 0, 100);
    model.scale = clamp(Number(model.scale ?? DEFAULT_SCALE), MIN_SCALE, MAX_SCALE);
    saveModelDebounced(model);
  }

  window.addEventListener("pointerup", finalizePointer);
  window.addEventListener("pointercancel", finalizePointer);
}

/* ===========================
   Firebase realtime listeners
   =========================== */
onChildAdded(ORN_REF, snap => {
  const model = snap.val();
  if (!model || !model.id) return;
  // normalize
  model.x = Number(model.x ?? 50);
  model.y = Number(model.y ?? 45);
  model.scale = Number(model.scale ?? DEFAULT_SCALE);
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
   Theme toggle (works for button or checkbox)
   =========================== */
function initThemeToggle() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.dataset.theme = saved;

  if (!themeToggle) return;

  // if checkbox input
  if (themeToggle.type === 'checkbox') {
    themeToggle.checked = saved === 'dark';
    themeToggle.addEventListener('change', () => {
      const t = themeToggle.checked ? 'dark' : 'light';
      document.documentElement.dataset.theme = t;
      localStorage.setItem('theme', t);
    });
  } else {
    // button or other element -> toggle on click
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('theme', next);
      // if it's a toggle-like element, try toggling checked if present
      try { if ('checked' in themeToggle) themeToggle.checked = next === 'dark'; } catch {}
    });
  }
}

/* ===========================
   Optional: Save screenshot button (if exists)
   =========================== */
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    try {
      const { default: html2canvas } = await import("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.esm.js");
      const canvas = await html2canvas(stage, { backgroundColor: null, scale: 2 });
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = "tree-snapshot.png";
      a.click();
    } catch (e) {
      console.warn("Screenshot failed", e);
      alert("Screenshot failed. See console.");
    }
  });
}

/* ===========================
   Init
   =========================== */
initThemeToggle();

console.log("script.js initialized — pointer controls + firebase active.");
