/* =========================
   PRESENCE — SHARED SKY WITH FIREBASE
   ========================= */

document.addEventListener("DOMContentLoaded", () => {

  /* -------------------
     THEME TOGGLE
  ------------------- */
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

  /* -------------------
     CURRENT VISIT
  ------------------- */
  const now = new Date();
  const hour = now.getHours();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

  const visit = {
    month: monthKey,
    hour: hour,
    time: now.getTime(),
    page: window.location.pathname // optional: record which page
  };

  /* -------------------
     FIREBASE: PUSH VISIT
  ------------------- */
  const db = window.firebaseDB;
  const visitsRef = window.firebaseRef(db, "visits");
  window.firebasePush(visitsRef, visit);

  /* -------------------
     RENDER CONSTELLATION
  ------------------- */
  const wrapper = document.querySelector(".presence-wrapper");

  function renderConstellation(visitsObj) {
    if (!wrapper) return;
    wrapper.innerHTML = ""; // clear previous

    if (!visitsObj) return;

    // Firebase returns objects with unique keys
    const visits = Object.values(visitsObj);

    // Group by month
    const visitsByMonth = visits.reduce((acc, v) => {
      acc[v.month] = acc[v.month] || [];
      acc[v.month].push(v);
      return acc;
    }, {});

    Object.keys(visitsByMonth).sort().reverse().forEach(month => {
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
        dot.classList.add(v.hour >= 22 || v.hour < 5 ? "night" : "day");

        dot.style.left = `${Math.random() * 92 + 4}%`;
        dot.style.top = `${Math.random() * 92 + 4}%`;

        const ageDays = (Date.now() - v.time) / (1000*60*60*24);
        if (ageDays > 20) dot.classList.add("old");

        sky.appendChild(dot);
      });
    });
  }

  /* -------------------
     FIREBASE: LISTEN FOR UPDATES
  ------------------- */
  const onValue = window.firebaseOnValue;
  onValue(visitsRef, snapshot => {
    const visitsObj = snapshot.val();
    renderConstellation(visitsObj);
  });

});
