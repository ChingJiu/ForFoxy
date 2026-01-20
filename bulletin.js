// bulletin.js — Quiet Wall Logic

// ---------- Theme Toggle ----------

const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
root.setAttribute("data-theme", savedTheme);

if (themeToggle) {
  themeToggle.checked = savedTheme === "dark";

  themeToggle.addEventListener("change", () => {
    const newTheme = themeToggle.checked ? "dark" : "light";
    root.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });
}


// ---------- Firebase References ----------

const db = window.firebaseDB;
const ref = window.firebaseRef;
const push = window.firebasePush;
const onValue = window.firebaseOnValue;

const notesRef = ref(db, "bulletin");


// ---------- DOM Elements ----------

const noteInput = document.getElementById("noteInput");
const moodSelect = document.getElementById("moodSelect");
const pinButton = document.getElementById("pinNote");
const board = document.getElementById("bulletinBoard");


// ---------- Helpers ----------

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


// ---------- Post a Note ----------

if (pinButton) {
  pinButton.addEventListener("click", () => {
    const text = noteInput.value.trim();
    const mood = moodSelect.value;

    if (!text) return;

    const payload = {
      text,
      mood,
      timestamp: Date.now()
    };

    push(notesRef, payload);

    noteInput.value = "";
  });
}


// ---------- Render Board ----------

function renderNotes(snapshot) {
  board.innerHTML = "";

  const data = snapshot.val();
  if (!data) return;

  const entries = Object.entries(data).map(([id, note]) => ({
    id,
    ...note
  }));

  entries.sort((a, b) => b.timestamp - a.timestamp);

  entries.forEach(note => {
    const card = document.createElement("div");
    card.className = `bulletin-note mood-${note.mood}`;

    const text = document.createElement("div");
    text.className = "note-text";
    text.textContent = note.text;

    const meta = document.createElement("div");
    meta.className = "note-meta";

    const time = document.createElement("span");
    time.className = "note-time";
    time.textContent = formatTime(note.timestamp);

    const mood = document.createElement("span");
    mood.className = "note-mood";
    mood.textContent = note.mood;

    meta.appendChild(time);
    meta.appendChild(mood);

    card.appendChild(text);
    card.appendChild(meta);

    board.appendChild(card);
  });
}


// ---------- Live Sync ----------

onValue(notesRef, snapshot => {
  renderNotes(snapshot);
});


// ---------- Soft Keyboard Ritual ----------

if (noteInput) {
  noteInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      pinButton.click();
    }
  });
}
