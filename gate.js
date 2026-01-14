const PASSWORD = "79"; // simple gate, not real security

const input = document.getElementById("password");
const button = document.getElementById("enter");
const error = document.getElementById("error");

function unlock() {
  if (!input) return;

  if (input.value === PASSWORD) {
    sessionStorage.setItem("unlocked", "true");
    window.location.href = "lny.html";
  } else {
    error.textContent = "This space is not for you.";
    input.value = "";
  }
}

if (button) {
  button.addEventListener("click", unlock);
}

if (input) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") unlock();
  });
}
