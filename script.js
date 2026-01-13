document.addEventListener("DOMContentLoaded", () => {

const stage = document.getElementById("stage");
const layer = document.getElementById("decorate-layer");
const tray = document.getElementById("ornament-tray");
const bubble = document.getElementById("wish-bubble");
const bubbleText = document.getElementById("wish-text");
const bubbleClose = document.getElementById("wish-close");
const snowLayer = document.getElementById("snow-layer");

/* =========================
   ORNAMENT DATA
========================= */

const ORNAMENTS = {
  star: { img: "star.png", wish: "My lighthouse, my anchor, and my safe place. I miss you so much baby." },
  red: { img: "bauble-red.png", wish: "If you ever feel like you don't love anymore, please just tell me. But for now, please focus on me, be agressive, be posessive, be whoever you want in front of me. I love you for who you are, even if its just a fragment of you." },
  blue: { img: "bauble-blue.png", wish: "I wasn't prepared at the time you stepped into my life... at the end of the day, nothing makes sense except you." },
  candy: { img: "candy.png", wish: "Have a chocolate when you see this message. Hope it makes you smile. Thats the point for this message." },
  bell: { img: "bell.png", wish: "Take rest if you needed, do nothing if you can't be bother, think of me if you want to spiral. The world could always wait for my princess." },
  ginger: { img: "ginger.png", wish: "Hug hug baby. Stay warm and drink plenty of water in this winter. And don't forget my goodnight kisses." },
  present: { img: "present.png", wish: "I know people come and go, but I guess I did planned to keep taking the blue pills with you." },
  cat: { img: "cat.png", wish: "Stuff that I don't say it out: I wanted you to rest early, cause I hate to miss you too much during the day. I wanted you to not call me if its only a short call, cause I will miss you more afterwards. I wanted you to spiral with me, even though its just blind leading the blind. But I need you to know I am here for you." },
  wdzy: { img: "wdzy.png", wish: "Merry Christmas and a Happy New Year my foxy. I wish you joy and peace. Always, everyday, 24/7." }
};

/* =========================
   TREE POSITIONS
========================= */

const ORNAMENT_POSITIONS = {
  star: { x: 45, y: 70 },
  red: { x: 38, y: 30 },
  blue: { x: 56, y: 20 },
  candy: { x: 50, y: 48 },
  bell: { x: 70, y: 42 },
  ginger: { x: 34, y: 60 },
  present: { x: 68, y: 63 },
  cat: { x: 25, y: 76 },
  wdzy: { x: 79, y: 83 }
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

bubbleClose.addEventListener("click", () => bubble.hidden = true);

document.addEventListener("click", e => {
  if (!e.target.classList.contains("tree-ornament")) {
    bubble.hidden = true;
  }
});

/* =========================
   PLACE ORNAMENT
========================= */

function placeOnTree(type) {
  const data = ORNAMENTS[type];
  const pos = ORNAMENT_POSITIONS[type];

  const el = document.createElement("img");
  el.src = `ornaments/${data.img}`;
  el.className = "tree-ornament placed";
  el.style.position = "absolute";
  el.style.width = "80px";
  el.style.transform = "translate(-50%, -50%)";
  el.style.cursor = "pointer";
  el.style.transition = "left 2.5s ease, top 2.5s ease";

  // start from tray
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

  // show wish after arrival
  setTimeout(() => showWish(el, data.wish), 2600);

  el.addEventListener("click", e => {
    e.stopPropagation();
    showWish(el, data.wish);
  });
}

/* =========================
   SNOW
========================= */

function createSnowflake() {
  const flake = document.createElement("div");
  flake.className = "snowflake";
  flake.textContent = "❄";

  flake.style.left = Math.random() * 100 + "vw";
  flake.style.animationDuration = 6 + Math.random() * 6 + "s";
  flake.style.opacity = 0.4 + Math.random() * 0.6;
  flake.style.fontSize = 15 + Math.random() * 12 + "px";

  snowLayer.appendChild(flake);
  setTimeout(() => flake.remove(), 12000);
}

setInterval(createSnowflake, 400);

/* =========================
   TRAY
========================= */

tray.querySelectorAll(".ornament-template").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (!ORNAMENTS[type]) return;

    btn.style.opacity = "0";
    btn.style.pointerEvents = "none";
    placeOnTree(type);
  });
});

console.log("🎄 Ornament ritual ready");

});
