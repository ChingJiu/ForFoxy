document.addEventListener("DOMContentLoaded", () => {

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
  // MEMORY DATA
  // =========================
  const MEMORIES = {
    1: "From the very start, something was already leaning toward us.",
    2: "Silence stopped feeling like abandonment. It became space.",
    3: "Nothing was solved. Everything softened.",
    4: "This memory hasn’t decided what it wants to be yet."
  };


  const now = new Date();

  const visit = {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    hour: now.getHours(),
    time: now.getTime(),
    page: window.presence.html
  };
