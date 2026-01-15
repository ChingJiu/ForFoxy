document.addEventListener("DOMContentLoaded", () => {



  /* =========================
     THEME TOGGLE
  ========================= */
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const savedTheme = localStorage.getItem("theme") || "light";
  html.dataset.theme = savedTheme;
  themeToggle.checked = savedTheme === "dark";

  themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "dark" : "light";
    html.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  });

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
  function showWish(target, text) {
    bubbleText.textContent = text;
    bubble.hidden = false;

    const r = target.getBoundingClientRect();
    bubble.style.left = r.left + r.width / 2 + "px";
    bubble.style.top = r.top - 12 + "px";
    bubble.style.transform = "translate(-50%, -100%)";
  }

  function hideWish() {
    bubble.hidden = true;
  }

  bubbleClose.addEventListener("click", e => {
    e.stopPropagation();
    hideWish();
  });

  bubble.addEventListener("click", e => e.stopPropagation());

  document.addEventListener("click", hideWish);

  /* =========================
     ORNAMENT PLACEMENT
  ========================= */
  function placeOnTree(type) {
    const data = ORNAMENTS[type];
    const pos = ORNAMENT_POSITIONS[type];
    if (!data || !pos) return;

    const el = document.createElement("img");
    el.src = `ornaments/${data.img}`;
    el.className = "tree-ornament placed";

    const trayRect = tray.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();

    el.style.left = trayRect.left - stageRect.left + trayRect.width / 2 + "px";
    el.style.top = trayRect.top - stageRect.top + trayRect.height / 2 + "px";

    layer.appendChild(el);

    requestAnimationFrame(() => {
      const px = pctToPx(pos.x, pos.y);
      el.style.left = px.left + "px";
      el.style.top = px.top + "px";
    });

    setTimeout(() => showWish(el, data.wish), ORNAMENT_TRAVEL_TIME);

    el.addEventListener("click", e => {
      e.stopPropagation();
      showWish(el, data.wish);
    });
  }

 
 
});
