// script.js — Ornament Wishes (Local, Fixed)

const stage = document.getElementById("stage");
const layer = document.getElementById("decorate-layer");
const tray = document.getElementById("ornament-tray");
const themeToggle = document.getElementById("theme-toggle");
const lastEdit = document.getElementById("last-edit-date");

const bubble = document.getElementById("wish-bubble");
const bubbleText = document.getElementById("wish-text");

/* =========================
   ORNAMENT WISH DATA
   (EDIT YOUR WISHES HERE)
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
   ORNAMENT SOURCES
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

let bubbleTimer = null;

function showWish(el, text) {
  if (!text) return;

  bubbleText.textContent = text;
  bubble.hidden = false;

  const r = el.getBoundingClientRect();
  bubble.style.left = r.left + r.width / 2 + "px";
  bubble.style.top = r.top - 10 + "px";
  bubble.style.transform = "translate(-50%, -100%)";

  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    bubble.hidden = true;
  }, 6000);
}

/* Hide bubble when tapping elsewhere */
document.addEventListener("click", e => {
  if (!e.target.classList.contains("ornament-button")) {
    bubble.hidden = true;
  }
});

/* =========================
   CREATE ORNAMENT ON TREE
========================= */

function createOrnament(type) {
  const el = document.createElement("img");
  el.className = "placed-ornament ornament-button";
  el.src = `ornaments/${SOURCE[type]}`;
  el.alt = type;
  el.style.position = "absolute";
  el.style.transform = "translate(-50%, -50%)";
  el.style.width = "48px";
  el.setAttribute("role", "button");

  // default placement (center-ish)
  const pos = pctToPx(50, 45);
  el.style.left = pos.left + "px";
  el.style.top = pos.top + "px";

  el.addEventListener("click", e => {
    e.stopPropagation();
    showWish(el, ORNAMENT_WISHES[type]);
  });

  layer.appendChild(el);
}

/* =========================
   TRAY → ADD ORNAMENT
========================= */

tray?.querySelectorAll(".ornament-template").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (!type || !SOURCE[type]) return;
    createOrnament(type);
  });
});

/* =========================
   THEME TOGGLE
========================= */

if (themeToggle) {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") {
    document.documentElement.dataset.theme = "dark";
    themeToggle.checked = true;
  }

  themeToggle.addEventListener("change", () => {
    const dark = themeToggle.checked;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("theme", dark ? "dark" : "light");
  });
}

/* =========================
   FOOTER DATE
========================= */

if (lastEdit) {
  lastEdit.textContent = new Date().toLocaleDateString();
}

console.log("🎄 Ornament wishes loaded — local & intentional.");
