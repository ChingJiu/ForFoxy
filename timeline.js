document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // PASSWORD GATE (SESSION)
  // =========================
  if (sessionStorage.getItem("unlocked") !== "true") {
    window.location.replace("index.html");
    return; // STOP script execution
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

  // =========================
  // INITIAL STATE
  // =========================
  if (!overlay) return;
  overlay.hidden = true;

  // =========================
  // OPEN MEMORY
  // =========================
  entries.forEach(entry => {
    entry.addEventListener("click", () => {
      const id = entry.dataset.id;
      memoryContent.textContent = MEMORIES[id] || "";
      overlay.hidden = false;
    });
  });

  // =========================
  // CLOSE MEMORY
  // =========================
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      overlay.hidden = true;
    });
  }

  // Click outside box closes
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.hidden = true;
    }
  });

  // Prevent inner clicks from closing
  if (memoryBox) {
    memoryBox.addEventListener("click", e => {
      e.stopPropagation();
    });
  }

});
