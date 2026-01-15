/* =========================
   PRESENCE — SHARED SKY
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     THEME (GLOBAL)
     ========================= */
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const savedTheme = localStorage.getItem("theme") || "light";
  html.dataset.theme = savedTheme;

  if (themeToggle) {
    themeToggle.checked = savedTheme === "dark";

    themeToggle.addEventListener("change", () => {
      const theme = themeToggle.checked ? "dark" : "light";
      html.dataset.theme = theme;
      localStorage.setItem("theme", theme);
    });
  }

  /* =========================
     VISIT RECORD (GLOBAL)
     ========================= */

  const now = new Date();
  const visit = {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    hour: now.getHours(),
    time: now.getTime(),
    path: window.location.pathname   // ← which page
  };

  const STORAGE_KEY = "presence_shared_visits";
  const visits = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
