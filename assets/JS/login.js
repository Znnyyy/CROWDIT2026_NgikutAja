lucide.createIcons();

function togglePw() {
  const pw = document.getElementById("pw");
  const show = document.getElementById("eye-show");
  const hide = document.getElementById("eye-hide");
  const hidden = pw.type === "password";
  pw.type = hidden ? "text" : "password";
  show.classList.toggle("hidden", hidden);
  hide.classList.toggle("hidden", !hidden);
}
function login() {
  localStorage.setItem("name", "user");
  localStorage.setItem("token", "true");
  window.location.href = "../pages/t-mood.html";
}

window.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    login();
  }
});