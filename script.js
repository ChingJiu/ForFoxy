// script.js — Ornament Ritual with Fixed Positions & Wishes

const stage = document.getElementById("stage");
const layer = document.getElementById("decorate-layer");
const tray = document.getElementById("ornament-tray");

const bubble = document.getElementById("wish-bubble");
const bubbleText = document.getElementById("wish-text");
const bubbleClose = document.getElementById("wish-close");

/* =========================
   ORNAMENT DATA (EDIT HERE)
========================= */

const ORNAMENTS = {
  star: {
    img: "star.png",
    wish: "May this year end gently, and the next begin with courage."
  },
  red: {
    img: "bauble-red.png",
    wish: "I hope you always feel loved, even on the quiet days."
  },
  blue: {
    img: "bauble-blue.png",
    wish: "Peace doesn’t need to be loud to be real."
  },
  candy: {
    img: "candy.png",
    wish: "Sweet moments count, even the small ones."
  },
  bell: {
    img: "bell.png",
    wish: "You are allowed to rest. The world will wait."
  },
  ginger: {
    img: "ginger.png",
    wish: "Warmth can survive even the coldest seasons."
  },
  present: {
    img: "present.png",
    wish: "Not everything precious is wrapped."
  },
  cat: {
    img: "cat.png",
    wish: "Someone is always thinking of you, even if they don’t say it."
  },
   wdzy: {
    img: "wdzy.png",
    wish: "i miss you."
  }
};

/* =========================
   FIXED TREE POSITIONS (%)
========================= */

const ORNAMENT_POSITIONS = {
  star:    { x: 50, y: 18 },
  red:     { x: 38, y: 34 },
  blue:    { x: 62, y: 36 },
  candy:   { x: 45, y: 48 },
  bell:    { x: 55, y: 52 },
  ginger:  { x: 35, y: 62 },
  present: { x: 65, y: 66 },
  cat:     { x: 20, y: 78 },
   wdzy: { x: 70, y: 69 }
};

ornament.classList.add('placed');

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

/* =========================
   WISH BUBBLE
========================= */

function showWish(el, text) {
  bubbleText.textContent = text;
  bubble.hidden = false;

  const r = el.getBoundingClientRect();
  bubble.style.left = r.left + r.width / 2 + "px";
  bubble.style.top = r.top - 12 + "px";
  bubble.style.transform = "translate(-50%, -100%)";
}

bubbleClose.addEventListener("click", () => {
  bubble.hidden = true;
});

document.addEventListener("click", e => {
  if (!e.target.classList.contains("tree-ornament")) {
    bubble.hidden = true;
  }
});

/* =========================
   CREATE TREE ORNAMENT
========================= */

function placeOnTree(type) {
  const data = ORNAMENTS[type];
  const pos = ORNAMENT_POSITIONS[type];

  const el = document.createElement("img");
  el.src = `ornaments/${data.img}`;
  el.className = "placed-ornament tree-ornament";
  el.style.position = "absolute";
  el.style.width = "48px";
  el.style.transform = "translate(-50%, -50%)";
  el.style.cursor = "pointer";
  el.style.transition = "left 2.5s ease, top 2.5s ease";

  // start from tray position
  const trayRect = tray.getBoundingClientRect();
  const stageRect = stage.getBoundingClientRect();

  el.style.left = trayRect.left - stageRect.left + trayRect.width / 2 + "px";
  el.style.top = trayRect.top - stageRect.top + trayRect.height / 2 + "px";

  layer.appendChild(el);

  // drift to final position
  requestAnimationFrame(() => {
    const px = pctToPx(pos.x, pos.y);
    el.style.left = px.left + "px";
    el.style.top = px.top + "px";
  });

  // show wish once arrived
  setTimeout(() => {
    showWish(el, data.wish);
  }, 2600);

  // tap to re-open wish
  el.addEventListener("click", e => {
    e.stopPropagation();
    showWish(el, data.wish);
  });
}

const snowLayer = document.getElementById("snow-layer");

function createSnowflake() {
  const flake = document.createElement("div");
  flake.className = "snowflake";
  flake.textContent = "❄";

  flake.style.left = Math.random() * 100 + "vw";
  flake.style.animationDuration = 6 + Math.random() * 6 + "s";
  flake.style.opacity = 0.4 + Math.random() * 0.6;
  flake.style.fontSize = 10 + Math.random() * 12 + "px";

  snowLayer.appendChild(flake);

  setTimeout(() => flake.remove(), 12000);
}

// steady snowfall
setInterval(createSnowflake, 400);


/* =========================
   TRAY INTERACTION
========================= */

tray.querySelectorAll(".ornament-template").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (!ORNAMENTS[type]) return;

    // remove from tray
    btn.style.opacity = "0";
    btn.style.pointerEvents = "none";

    placeOnTree(type);
  });
});

console.log("🎄 Ornament ritual ready.");
