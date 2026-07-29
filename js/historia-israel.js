(() => {
  const elemento = document.getElementById('timeline-embed');

  if (!elemento || typeof TL === 'undefined') {
    return;
  }

  const opcoes = {
    language: 'pt-br',
    height: 650,
    timenav_position: 'bottom',
    start_at_slide: 0,
    hash_bookmark: true,
    initial_zoom: 1,
    zoom_sequence: [0.25, 0.5, 1, 2, 4, 8],
    marker_height_min: 30,
    marker_width_min: 100,
    scale_factor: 2
  };

  window.timelineIsrael = new TL.Timeline(
    'timeline-embed',
    'dados/historia-israel.json',
    opcoes
  );

  window.addEventListener('resize', () => {
    window.timelineIsrael?.updateDisplay();
  });

  window.addEventListener(
    'teologiaNinja:accentChange',
    () => {
      document.documentElement.style.setProperty(
        '--timeline-accent',
        getComputedStyle(document.documentElement)
          .getPropertyValue('--accent')
          .trim()
      );
    }
  );
})();
