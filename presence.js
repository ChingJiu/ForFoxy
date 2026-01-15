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

  visits.push(visit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));

  /* =========================
     RENDER CONSTELLATION
     (ONLY IF PRESENT)
     ========================= */

  const wrapper = document.querySelector(".presence-wrapper");
  if (!wrapper) return; // ← silently exit on non-constellation pages

  const visitsByMonth = visits.reduce((acc, v) => {
    acc[v.month] = acc[v.month] || [];
    acc[v.month].push(v);
    return acc;
  }, {});

  Object.keys(visitsByMonth)
    .sort()
    .reverse()
    .forEach(month => {
      const label = document.createElement("div");
      label.className = "month-label";
      label.textContent = month;

      const sky = document.createElement("div");
      sky.className = "month-sky";

      wrapper.appendChild(label);
      wrapper.appendChild(sky);

      visitsByMonth[month].forEach(v => {
        const dot = document.createElement("div");
        dot.classList.add("presence-dot");

        const isNight = v.hour >= 22 || v.hour < 5;
        dot.classList.add(isNight ? "night" : "day");

        dot.style.left = `${Math.random() * 92 + 4}%`;
        dot.style.top = `${Math.random() * 92 + 4}%`;

        const ageDays = (Date.now() - v.time) / (1000 * 60 * 60 * 24);
        if (ageDays > 20) dot.classList.add("old");

        sky.appendChild(dot);
      });
    });
});
