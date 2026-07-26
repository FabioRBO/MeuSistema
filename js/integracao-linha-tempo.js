(function () {
  const CHAVE_COR = "teologiaNinja_corDestaque";
  const coresValidas = ["purple", "blue", "green", "orange", "red", "gray"];
  const corSalva = localStorage.getItem(CHAVE_COR);

  if (corSalva && coresValidas.includes(corSalva)) {
    document.documentElement.setAttribute("data-accent", corSalva);
  }

  function atualizarTemaDoNavegador() {
    const tema = document.documentElement.getAttribute("data-bs-theme") || "dark";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", tema === "dark" ? "#0d1017" : "#f7f8fb");
    }
  }

  const observador = new MutationObserver(atualizarTemaDoNavegador);
  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-bs-theme"]
  });

  atualizarTemaDoNavegador();
})();
