document.addEventListener("DOMContentLoaded", () => {

  const entries = document.querySelectorAll(".timeline-entry");
  const overlay = document.getElementById("memory-overlay");
  const memoryContent = document.getElementById("memory-content");
  const closeBtn = document.getElementById("close-memory");

  const MEMORIES = {
    1: "Waiting was not passive. It was an act of trust, repeated daily.",
    2: "Silence stopped feeling like abandonment. It became space.",
    3: "Nothing was solved. Everything softened.",
    4: "This memory hasn’t decided what it wants to be yet."
  };

  entries.forEach(entry => {
    entry.addEventListener("click", () => {
      const id = entry.dataset.id;
      memoryContent.textContent = MEMORIES[id] || "";
      overlay.hidden = false;
    });
  });

  closeBtn.addEventListener("click", () => {
    overlay.hidden = true;
  });

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.hidden = true;
    }
  });

});
