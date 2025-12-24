// script.js — Ornament Wishes with Gentle Drift

const stage = document.getElementById("stage");
const layer = document.getElementById("decorate-layer");
const tray = document.getElementById("ornament-tray");
const themeToggle = document.getElementById("theme-toggle");
const lastEdit = document.getElementById("last-edit-date");

const bubble = document.getElementById("wish-bubble");
const bubbleText = document.getElementById("wish-text");

/* =========================
   WISH CONTENT (EDIT HERE)
========================= */

const ORNAMENT_WISHES = {
  star: "May this year end gently, and the next begin with courage.",
  red: "I hope you always feel loved, even on the quiet days.",
  blue: "Peace doesn’t need to be loud to be real.",
  candy: "Sweet moments count, even the small ones.",
  bell: "You are allowed to rest. The world will wait.",
  ginger: "Warmth can survive even the coldest seasons.",
  present: "Not everything precious is wrapped.",
  cat: "Someone is always thinking of you, even if they don’t say it."
};

/* =========================
   IMAGE SOURCES
========================= */

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

/* =========================
   HELPERS
========================= */

function pctToPx(xPct, yPct) {
  const r = stage.getBoundingClientRect();
  return {
    left: (xPct / 100) * r.width,
    top: (yPct / 100) * r.height
  };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* =========================
   WISH BUBBLE
========================= */

let bubbleTimer = null;

function showWish(el, text) {
  bubbleText.textContent = text;
  bubble.hidden = false;

  const r = el.getBoundingClientRect();
  bubble.style.left = r.left + r.width / 2 + "px";
  bubble.style.top = r.top - 12 + "px";
  bubble.style.transform = "translate(-50%, -100%)";

  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    bubble.hidden = true;
  }, 6500);
}

document.addEventListener("click", e => {
  if (!e.target.classList.contains("ornament-button")) {
    bubble.hidden = true;
  }
});

/* =========================
   GENTLE DRIFT LOGIC
========================= */

function driftOrnament(el) {
  const currentX = parseFloat(el.dataset.x);
  const currentY = parseFloat(el.dataset.y);

  // small poetic movement
  const dx = (Math.random() - 0.5) * 12; // px
  const dy = (Math.random() - 0.5) * 14;

  const r = stage.getBoundingClientRect();

  let px = (currentX / 100) * r.width + dx;
  let py = (currentY / 100) * r.height + dy;

  // convert back to %
  const newX = clamp((px / r.width) * 100, 15, 85);
  const newY = clamp((py / r.height) * 100, 18, 82);

  el.dataset.x = newX;
  el.dataset.y = newY;

  el.style.transition = "transform 2.8s ease, left 2.8s ease, top 2.8s ease";
  el.style.left = pxToLeft(newX) + "px";
  el.style.top = pxToTop(newY) + "px";
}

function pxToLeft(xPct) {
  return (xPct / 100) * stage.getBoundingClientRect().width;
}

function pxToTop(yPct) {
  return (yPct / 100) * stage.getBoundingClientRect().height;
}

/* =========================
   CREATE ORNAMENT
========================= */

function createOrnament(type) {
  const el = document.createElement("img");
  el.className = "placed-ornament ornament-button";
  el.src = `ornaments/${SOURCE[type]}`;
  el.alt = type;
  el.style.position = "absolute";
  el.style.transform = "translate(-50%, -50%)";
  el.style.width = "48px";
  el.style.cursor = "pointer";

  // initial placement
  const x = 50;
  const y = 45;

  el.dataset.x = x;
  el.dataset.y = y;

  el.style.left = pxToLeft(x) + "px";
  el.style.top = pxToTop(y) + "px";

  el.addEventListener("click", e => {
    e.stopPropagation();
    showWish(el, ORNAMENT_WISHES[type]);
    driftOrnament(el);
  });

  layer.appendChild(el);
}

/* =========================
   TRAY TAP
========================= */

tray?.querySelectorAll(".ornament-template").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (SOURCE[type]) createOrnament(type);
  });
});

/* =========================
   THEME + FOOTER
========================= */

if (themeToggle) {
  themeToggle.addEventListener("change", e => {
    document.body.classList.toggle("night", e.target.checked);
  });
}

if (lastEdit) {
  lastEdit.textContent = new Date().toLocaleDateString();
}

console.log("🎄 Wishes drift gently across the tree.");
