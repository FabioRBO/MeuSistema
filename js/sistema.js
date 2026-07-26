
const CHAVE_MENU_RECOLHIDO = "teologiaNinja_menuRecolhido";
const btnOcultarMenu = document.getElementById("btnOcultarMenu");

function aplicarEstadoMenu(recolhido) {
  document.body.classList.toggle("menu-recolhido", recolhido);
  localStorage.setItem(CHAVE_MENU_RECOLHIDO, recolhido ? "1" : "0");

  if (btnOcultarMenu) {
    btnOcultarMenu.title = recolhido ? "Mostrar menu" : "Ocultar menu";
    btnOcultarMenu.setAttribute(
      "aria-label",
      recolhido ? "Mostrar menu lateral" : "Ocultar menu lateral"
    );
  }
}

if (btnOcultarMenu) {
  btnOcultarMenu.addEventListener("click", () => {
    aplicarEstadoMenu(!document.body.classList.contains("menu-recolhido"));
  });
}

aplicarEstadoMenu(localStorage.getItem(CHAVE_MENU_RECOLHIDO) === "1");
