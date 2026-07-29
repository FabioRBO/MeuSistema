(() => {
  const alvo = document.getElementById('menuCulturaConteudo');
  if (!alvo) return;

  fetch('dados/categorias.json')
    .then(r => r.json())
    .then(dados => {
      alvo.innerHTML = dados.grupos.map(grupo => `
        <section class="menu-cultura-grupo">
          <h3>${grupo.titulo}</h3>
          <div class="menu-cultura-lista">
            ${grupo.itens.map(item => `
              <a href="${item.href}">${item.icone || '•'} ${item.nome}</a>
            `).join('')}
          </div>
        </section>
      `).join('');
    })
    .catch(() => {
      alvo.innerHTML = '<p class="text-secondary">Não foi possível carregar o menu.</p>';
    });
})();
