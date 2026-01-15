document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // THEME TOGGLE
  // =========================
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

  // =========================
  // ELEMENTS
  // =========================
  const entries = document.querySelectorAll(".timeline-entry");
  const overlay = document.getElementById("memory-overlay");
  const memoryContent = document.getElementById("memory-content");
  const closeBtn = document.getElementById("close-memory");
  const memoryBox = document.querySelector(".memory-box");

 
  // =========================
  // VISIT RECORD
  // =========================
  const now = new Date();

  const visit = {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    hour: now.getHours(),
    time: now.getTime(),
    page: window.location.pathname
  };

  // (store / sync logic can live here)

});
