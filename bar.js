document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     DOM REFERENCES
  ========================= */
  const stage = document.getElementById("stage");
  const layer = document.getElementById("decorate-layer");
  const tray = document.getElementById("ornament-tray");

  const bubble = document.getElementById("wish-bubble");
  const bubbleText = document.getElementById("wish-text");
  const bubbleClose = document.getElementById("wish-close");

  const snowLayer = document.getElementById("snow-layer");

  
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

})
