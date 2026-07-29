(() => {
  const id = new URLSearchParams(location.search).get('id') || 'kipa';

  fetch('dados/objetos.json')
    .then(r => r.json())
    .then(dados => {
      const objeto = dados.itens.find(item => item.id === id) || dados.itens[0];

      document.getElementById('objetoTitulo').textContent = objeto.nome;
      document.getElementById('objetoResumo').textContent = objeto.resumo;

      const hero = document.getElementById('objetoHero');
      if (objeto.imagemPrincipal) {
        hero.style.backgroundImage =
          `linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,.48)),url("${objeto.imagemPrincipal}")`;
      }

      document.getElementById('objetoPontos').innerHTML =
        objeto.pontos.map(p => `
          <article class="objeto-ponto">
            <strong>${p.ordem}. ${p.titulo}</strong>
            <p class="mb-0 mt-2">${p.descricao}</p>
          </article>
        `).join('');

      document.getElementById('objetoFontes').innerHTML =
        objeto.fontes?.length
          ? objeto.fontes.map(f => `<a href="${f.url}" target="_blank">${f.titulo}</a>`).join('')
          : '<span class="text-secondary">Fontes serão adicionadas.</span>';
    });
})();
