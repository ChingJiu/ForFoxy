const PASSWORD_HASH = "79"; // you can change this

const input = document.getElementById("password");
const button = document.getElementById("enter");
const error = document.getElementById("error");

button.addEventListener("click", unlock);
input.addEventListener("keydown", e => {
  if (e.key === "Enter") unlock();
});

function unlock() {
  if (input.value === PASSWORD_HASH) {
    sessionStorage.setItem("unlocked", "true");
    window.location.href = "presence.html";
  } else {
    error.textContent = "This space is not for you.";
    input.value = "";
  }
}
