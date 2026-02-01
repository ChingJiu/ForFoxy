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
     DRINK MESSAGES
  ========================= */

  const drinkMessages = {
    trad_coco: [
      "Slow down. Let your shoulders fall. You don’t have to hold the world tonight.",
      "Something warm is wrapping around you. Stay here a little longer.",
      "You’re allowed to feel soft and heavy at the same time."
    ],
    foxy_coco: [
      "You're allowed to slow down. Let your shoulders fall.",
      "Having the courage to allow a breakdown, is for you to rebuild yourself.",
      "Even in your most fragile moments, you are still becoming."
    ],
    pup_coco: [
      "I love you. I love you too. I love you no matter first or last. And I love you.",
      "Thank you for choosing me continuously, thank you for trusting me, thank you for holding my vulnerability.",
      "I wish you love that meets you where you are, that recognises every part of you, that never makes you chase."
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
    ]
  };

  const drinkKeys = Object.keys(drinkMessages);

  /* =========================
     ELEMENTS
  ========================= */

  const drinks = document.querySelectorAll(".drink");
  const overlay = document.querySelector(".bar-overlay");
  const messageText = document.querySelector(".bar-message-text");

  if (!drinks.length || !overlay || !messageText) {
    console.error("Missing required elements: .drink, .bar-overlay, or .bar-message-text");
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

    if (!drinkMessages[resolved]) {
      console.error(`No messages found for drink: ${resolved}`);
      return;
    }

    const messages = drinkMessages[resolved];

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error(`Message array missing or empty for: ${resolved}`);
      return;
    }

    const message = pickRandom(messages);
    messageText.textContent = message;
    overlay.hidden = false;
  }

  function closeMessage() {
    overlay.hidden = true;
  }

  /* =========================
     CLICK HANDLERS
  ========================= */

  drinks.forEach(drink => {
    const key = drink.dataset.drink;
    if (!key) return;

    drink.addEventListener("click", () => {
      openMessage(key);
    });
  });

  /* =========================
     CLOSE OVERLAY WHEN CLICKING OUTSIDE
  ========================= */

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeMessage();
    }
  });

});
