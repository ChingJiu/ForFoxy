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
      "In case I don't say it enough: I appreciate you. I believe in you. And you are just really special.",
      "Don't care what you gonna say, I definitely love you more. (okay prove me wrong :ragebaiting you kekeke)",
      "What the world really needs, is probably more love (like us) and less paperwork (meeting is banned :3)."
    ],
    foxy_coco: [
      "You're allowed to slow down. Let your shoulders fall.",
      "Breaking down is not scary. Let everything out, allow yourself to rebuild yourself.",
      "You are so loved. So cherished. Stay grounded. You are here and your heart is still beating."
    ],
    pup_coco: [
      "I love you. I love you too. I love you no matter first or last. And I love you.",
      "Thank you for choosing me continuously, thank you for trusting me, thank you for holding my vulnerability.",
      "I wish you love that meets you where you are, that recognises every part of you, that never makes you chase."
    ],
    matcha_coco: [
      "Do you like raisin? How about date? You know, a date with me.",
      "You're my favourite notification. Ping me when you read this.",
      "I love you more than the cat (almost). :this line suits you."
    ],
    wine_coco: [
      "I think of you as many times as the stars blinked at me tonight. And it's a clear sky tonight.",
      "I still listen to The Christmas Song sometimes. And read the poem, and the letter, and the trivia.",
      "Be my valentine. Be my baby. Be my... mine."
    ],
    random: [
      "Orion.",
      "Hello.",
      "songs of the year?"
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
    const wasRandom = drinkKey === "random";
    const resolved = resolveDrink(drinkKey);

    const messages = drinkMessages[resolved];

    if (!Array.isArray(messages) || messages.length === 0) {
      console.error(`Message array missing or empty for: ${resolved}`);
      return;
    }

    const chosenMessage = pickRandom(messages);

    if (wasRandom) {
  const prettyName = resolved
    .replace("_coco", "")
    .replace("_", " ")
    .replace(/\b\w/g, c => c.toUpperCase()); // makes it pretty title case

  messageText.innerHTML = `
    <div class="random-picked">Random chose: ${prettyName}</div>
    <div class="random-message">${chosenMessage}</div>
  `;
} else {
  messageText.textContent = chosenMessage;
}

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
