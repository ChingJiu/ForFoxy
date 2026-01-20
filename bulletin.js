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
  // FIREBASE SETUP
  // =========================
  const db = window.firebaseDB;
  const ref = window.firebaseRef;
  const push = window.firebasePush;
  const onValue = window.firebaseOnValue;
  const remove = window.firebaseRemove;

  const notesRef = ref(db, "bulletin");

  // =========================
  // ELEMENTS (MATCH HTML)
  // =========================
  const input = document.getElementById("noteInput");
  const moodSelect = document.getElementById("moodSelect");
  const pinBtn = document.getElementById("pinNote");
  const board = document.getElementById("bulletinBoard");

  // =========================
  // SUBMIT NOTE
  // =========================
  if (pinBtn) {
    pinBtn.addEventListener("click", () => {
      const text = input.value.trim();
      const mood = moodSelect.value;

      if (!text) return;

      const now = new Date();

      const note = {
        text,
        mood,
        time: now.toISOString(),
        timestamp: now.getTime()
      };

      push(notesRef, note);

      input.value = "";
      moodSelect.value = "soft";
    });
  }

  // =========================
  // RENDER NOTES
  // =========================
  onValue(notesRef, (snapshot) => {
    board.innerHTML = "";

    const data = snapshot.val();
    if (!data) return;

    const notes = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.timestamp - a.timestamp);

    notes.forEach(note => {
      const card = document.createElement("div");
      card.className = `bulletin-note mood-${note.mood}`;
      card.dataset.id = note.id;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-note";
      deleteBtn.setAttribute("aria-label", "Delete note");
      deleteBtn.textContent = "×";

      deleteBtn.addEventListener("click", () => {
        card.classList.add("removing");

        setTimeout(() => {
          const noteRef = ref(db, `bulletin/${note.id}`);
          remove(noteRef);
        }, 300);
      });

      const textEl = document.createElement("div");
      textEl.className = "note-text";
      textEl.textContent = note.text;

      const meta = document.createElement("div");
      meta.className = "note-meta";

      const timeEl = document.createElement("span");
      timeEl.className = "note-time";
      timeEl.textContent = formatTime(note.time);

      const moodEl = document.createElement("span");
      moodEl.className = "note-mood";
      moodEl.textContent = note.mood;

      meta.appendChild(timeEl);
      meta.appendChild(moodEl);

      card.appendChild(deleteBtn);
      card.appendChild(textEl);
      card.appendChild(meta);

      board.appendChild(card);
    });
  });

  // =========================
  // UTIL
  // =========================
  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { 
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit" 
    });
  }

});
