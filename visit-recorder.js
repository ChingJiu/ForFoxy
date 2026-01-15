document.addEventListener("DOMContentLoaded", () => {
  if (!window.firebaseDB) return;

  const now = new Date();

  const visit = {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    hour: now.getHours(),
    time: now.getTime(),
    page: window.location.pathname
  };

  const db = window.firebaseDB;
  const visitsRef = window.firebaseRef(db, "visits");

  window.firebasePush(visitsRef, visit);
});
