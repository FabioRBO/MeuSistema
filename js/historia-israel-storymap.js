(() => {
  const alvo = document.getElementById('storymap-embed');

  if (!alvo) {
    return;
  }

  fetch('dados/historia-israel-storymap.json')
    .then(resposta => {
      if (!resposta.ok) {
        throw new Error(
          'Não foi possível carregar o StoryMap.'
        );
      }

      return resposta.json();
    })
    .then(dados => {
      if (typeof VCO === 'undefined' || !VCO.StoryMap) {
        throw new Error(
          'A biblioteca StoryMapJS não foi carregada.'
        );
      }

      window.storyMapIsrael = new VCO.StoryMap(
        'storymap-embed',
        dados,
        {
          language: 'pt'
        }
      );

      window.addEventListener('resize', () => {
        window.storyMapIsrael?.updateDisplay();
      });
    })
    .catch(erro => {
      console.error(erro);

      alvo.innerHTML = `
        <div class="storymap-erro">
          <strong>Não foi possível carregar o mapa.</strong>
          <p>
            Abra a página por um servidor local ou pelo
            GitHub Pages.
          </p>
        </div>
      `;
    });
})();
