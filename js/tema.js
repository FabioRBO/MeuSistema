
const CHAVE_TEMA = "teologiaNinja_tema";
const btnTema = document.getElementById("btnTema");

function obterTemaAtual() {
  return document.documentElement.getAttribute("data-bs-theme") || "dark";
}

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);
  localStorage.setItem(CHAVE_TEMA, tema);

  if (btnTema) {
    btnTema.setAttribute(
      "aria-label",
      tema === "dark" ? "Ativar tema claro" : "Ativar tema escuro"
    );

    if (!btnTema.classList.contains("theme-switch")) {
      btnTema.textContent = tema === "dark" ? "☀️" : "🌙";
    }
  }
}

if (btnTema) {
  btnTema.addEventListener("click", () => {
    aplicarTema(obterTemaAtual() === "dark" ? "light" : "dark");
  });
}

aplicarTema(localStorage.getItem(CHAVE_TEMA) || obterTemaAtual());
