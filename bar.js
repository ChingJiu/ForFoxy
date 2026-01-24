document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     THEME TOGGLE (CONSISTENT)
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
     DRINK MESSAGE DATA
  ========================= */

  const DRINKS = {
    wine: [
      "A slow evening. Soft light. You’re allowed to rest here.",
      "Something gentle wants to unfold between your thoughts.",
      "This moment doesn’t need fixing. Just letting it be is enough.",
      "You are not late to your own life."
    ],

    coffee: [
      "Focus returns when you stop chasing it.",
      "You’re allowed to want more. That doesn’t make you ungrateful.",
      "There’s clarity hiding under the noise. You already feel it.",
      "You’re sharper than you think right now."
    ],

    tea: [
      "Breathe. Your nervous system deserves softness.",
      "You don’t have to explain yourself today.",
      "Stillness is also progress.",
      "You are safe to slow down here."
    ],

    cocktail: [
      "Something playful wants your attention tonight.",
      "It’s okay to flirt with possibility again.",
      "Not everything meaningful has to be heavy.",
      "You’re more magnetic than you realize."
    ],

    chocolate: [
      "You deserve sweetness without justification.",
      "Your tenderness is not a weakness.",
      "You’ve been strong for a long time. Let yourself melt.",
      "Comfort is not laziness. It’s repair."
    ],

    midnight: [
      "Your night thoughts are trying to protect you.",
      "You are not broken. You are processing.",
      "Loneliness is a phase, not a verdict.",
      "Someone would recognize your softness instantly."
    ]
  };


  /* =========================
     ELEMENTS
  ========================= */

  const drinkButtons = document.querySelectorAll(".drink");
  const messagePanel = document.querySelector(".bar-message");
  const messageText = document.querySelector(".bar-message-text");
  const messageDrink = document.querySelector(".bar-message-drink");

  let lastDrink = null;
  let lastMessage = null;


  /* =========================
     CORE LOGIC
  ========================= */

  function getRandom(arr, exclude = null) {
    if (!arr || arr.length === 0) return null;

    let choice;
    do {
      choice = arr[Math.floor(Math.random() * arr.length)];
    } while (choice === exclude && arr.length > 1);

    return choice;
  }

  function resolveDrink(drinkKey) {
    if (drinkKey === "random") {
      const keys = Object.keys(DRINKS);
      return getRandom(keys, lastDrink);
    }
    return drinkKey;
  }

  function showMessage(drinkKey) {
    const realDrink = resolveDrink(drinkKey);
    const messages = DRINKS[realDrink];

    if (!messages) return;

    const message = getRandom(messages, lastMessage);

    lastDrink = realDrink;
    lastMessage = message;

    messageText.textContent = message;
    messageDrink.textContent = realDrink.toUpperCase();

    messagePanel.classList.remove("show");
    void messagePanel.offsetWidth; // reset animation

    messagePanel.classList.add("show");
  }


  /* =========================
     EVENTS
  ========================= */

  drinkButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const drink = btn.dataset.drink;
      showMessage(drink);
    });
  });


  /* =========================
     OPTIONAL: TIME-BASED MOOD
  ========================= */

  const hour = new Date().getHours();

  if (hour >= 22 || hour <= 4) {
    if (!DRINKS.midnight) {
      DRINKS.midnight = [
        "It’s late. You don’t have to carry everything alone.",
        "Your quiet hours are sacred.",
        "You’re allowed to exist without performing.",
        "Even now, you matter intensely."
      ];
    }
  }

});
