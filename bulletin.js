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

  const db = window.firebaseDB;
  const ref = window.firebaseRef;
  const push = window.firebasePush;
  const onValue = window.firebaseOnValue;
  const remove = window.firebaseRemove;

  const notesRef = ref(db, "bulletin");

  const input = document.getElementById("noteInput");
  const moodSelect = document.getElementById("moodSelect");
  const pinBtn = document.getElementById("pinNote");
  const board = document.getElementById("bulletinBoard");

  // Disable until auth ready
  pinBtn.disabled = true;

  // Submit note
  pinBtn.addEventListener("click", async () => {

    if (!window.firebaseAuthReady) {
      console.error("Auth not ready.");
      return;
    }

    const text = input.value.trim();
    if (!text) return;

    const now = new Date();

    const note = {
      text,
      mood: moodSelect.value,
      time: now.toISOString(),
      timestamp: now.getTime()
    };

    try {
      await push(notesRef, note);
      input.value = "";
      moodSelect.value = "soft";
    } catch (err) {
      console.error("Push failed:", err);
    }
  });

  // Render notes
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

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-note";
      deleteBtn.textContent = "×";

      deleteBtn.addEventListener("click", async () => {
        card.classList.add("removing");
        setTimeout(async () => {
          try {
            await remove(ref(db, `bulletin/${note.id}`));
          } catch (err) {
            console.error("Delete failed:", err);
          }
        }, 300);
      });

      const textEl = document.createElement("div");
      textEl.className = "note-text";
      textEl.textContent = note.text;

      const meta = document.createElement("div");
      meta.className = "note-meta";

      const timeEl = document.createElement("span");
      timeEl.textContent = formatTime(note.time);

      const moodEl = document.createElement("span");
      moodEl.textContent = note.mood;

      meta.appendChild(timeEl);
      meta.appendChild(moodEl);

      card.appendChild(deleteBtn);
      card.appendChild(textEl);
      card.appendChild(meta);

      board.appendChild(card);
    });
  });

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

});
