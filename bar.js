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
  // DRINK DATA
  // =========================
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
    cocktail: [
      "You’re magnetic when you’re playful like this.",
      "Tonight isn’t meant to be serious. Let it tilt sideways.",
      "You deserve something indulgent for no reason."
    ],
    chocolate: [
      "You’ve done enough today. This is a reward, not a delay.",
      "Something sweet for someone who gives too much.",
      "You don’t have to earn softness. It’s already yours."
    ],
    midnight: [
      "You’re still here. That counts more than you think.",
      "Even at your quietest, you are not invisible.",
      "The night isn’t empty. It’s holding you."
    ]
  };

  const drinkOrder = Object.keys(drinkMessages);

  // =========================
  // ELEMENTS
  // =========================
  const drinks = document.querySelectorAll(".drink");
  const messageDrinkEl = document.querySelector(".bar-message-drink");
  const messageTextEl = document.querySelector(".bar-message-text");

  // =========================
  // HELPERS
  // =========================
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function resolveDrink(drinkKey) {
    if (drinkKey === "random") {
      return pickRandom(drinkOrder);
    }
    return drinkKey;
  }

  function displayMessage(drinkKey) {
    const resolvedDrink = resolveDrink(drinkKey);
    const messages = drinkMessa
