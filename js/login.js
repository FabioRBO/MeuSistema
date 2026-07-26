
const formLogin = document.getElementById("formLogin");
const campoSenha = document.getElementById("senha");
const btnMostrarSenha = document.getElementById("btnMostrarSenha");

btnMostrarSenha.addEventListener("click", () => {
  const visivel = campoSenha.type === "text";
  campoSenha.type = visivel ? "password" : "text";
  btnMostrarSenha.textContent = visivel ? "👁️" : "🙈";
});

formLogin.addEventListener("submit", evento => {
  evento.preventDefault();
  window.location.href = "menu.html";
});
