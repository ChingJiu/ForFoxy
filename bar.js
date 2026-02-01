document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     THEME TOGGLE
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
     DRINK DATA
  ========================= */
  const drinkMessages = {
    trad_coco: [
      "Slow down. Let your shoulders fall. You don’t have to hold the world tonight.",
      "Something warm is wrapping around you. Stay here a little longer.",
      "You’re allowed to feel soft and heavy at the same time."
    ],
    foxy_coco: [
      "You still have fire in you. Even if you feel tired, it’s there.",
      "Get up gently. The world can wait another minute.",
      "You’re sharper than you think. Don’t underestimate yourself."
    ],
    pup_coco: [
      "Quiet moments count too. You don’t need to be loud to matter.",
      "Breathe. This is one of the safe pauses.",
      "Your thoughts can rest for a second."
    ],
    matcha_coco: [
      "You still have fire in you. Even if you feel tired, it’s there.",
      "Get up gently. The world can wait another minute.",
      "You’re sharper than you think. Don’t underestimate yourself."
    ],
    wine_coco: [
      "You still have fire in you. Even if you feel tired, it’s there.",
      "Get up gently. The world can wait another minute.",
      "You’re sharper than you think. Don’t underestimate yourself."
    ],
  };

  const drinkKeys = Object.keys(drinkMessages);

  /* =========================
     ELEMENTS
  ========================= */
  const drinks = document.querySelectorAll(".drink");
  const overlay = document.querySelector(".bar-overlay");
  const messageText = document.querySelector(".bar-message-text");

  if (!drinks.length || !overlay || !messageText) {
    console.warn("Bar page: missing required elements.");
    return;
  }

  /* =========================
     HELPERS
  ========================= */
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function resolveDrink(key) {
    if (key === "random") {
      return pickRandom(drinkKeys);
    }
    return key;
  }

  function openMessage(drinkKey) {
    const resolved = resolveDrink(drinkKey);
    const message = pickRandom(drinkMessages[resolved]);

    messageText.textContent = message;
    overlay.hidden = false;
  }

  function closeMessage() {
    overlay.hidden = true;
  }

  /* =========================
     BIND DRINK CLICKS
  ========================= */
  drinks.forEach(drink => {
    const key = drink.dataset.drink;
    if (!key) return;

    drink.addEventListener("click", () => {
      openMessage(key);
    });
  });

  /* =========================
     CLOSE ON OUTSIDE CLICK
  ========================= */
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeMessage();
    }
  });

});
