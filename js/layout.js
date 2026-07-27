(() => {
  const cfg = window.TEOLOGIA_NINJA_PAGINA || {};
  const paginaAtual = cfg.pagina || location.pathname.split('/').pop() || 'menu.html';

  const itens = [
    ['menu.html','menu','🏠','Menu Principal'],
    ['#','arqueologia','🏺','Arqueologia',true],
    ['biblia.html','biblia','📖','Bíblia Interlinear'],
    ['#','bibliologia','📚','Bibliologia',true],
    ['#','escatologia','⌛','Escatologia',true],
    ['#','historia-israel','✡️','História de Israel',true],
    ['linha_tempo.html','linha-tempo','📅','Linha do Tempo'],
    ['mapa_linha_tempo.html','mapas','🗺️','Mapas Bíblicos'],
    ['#','personagens','👥','Personagens',true],
    ['DIV'],
    ['#','anotacoes','📝','Anotações',true],
    ['#','arquivos','📁','Arquivos',true],
    ['#','dicionario','Aa','Dicionário Strong',true],
    ['#','favoritos','❤️','Favoritos',true]
  ];

  const menu = itens.map(item => {
    if (item[0] === 'DIV') return '<div class="sidebar-divider"></div>';
    const ativo = cfg.ativo === item[1] || (!cfg.ativo && paginaAtual === item[0]);
    const cls = [ativo ? 'active' : '', item[4] ? 'disabled-link' : ''].filter(Boolean).join(' ');
    return `<a href="${item[0]}" class="${cls}">${item[2]} <span>${item[3]}</span></a>`;
  }).join('');

  const html = `
    <aside class="sidebar d-none d-lg-flex">
      <div class="sidebar-brand"><div>
      <strong>TEOLOGIA</strong><span>NINJA</span><small>${cfg.secao || 'PAINEL PRINCIPAL'}</small>
      </div>
      </div>
      
      <button id="btnOcultarMenu" class="sidebar-collapse-button" type="button" title="Ocultar menu">«</button>
      
      <nav class="sidebar-nav">
        ${menu}
        <div class="sidebar-divider"></div>
        <button class="sidebar-link-button" type="button" data-bs-toggle="offcanvas" data-bs-target="#configuracoesPainel">⚙️ <span>Configurações</span></button>
        <button class="sidebar-link-button" type="button" data-bs-toggle="modal" data-bs-target="#sobreModal">ℹ️ <span>Sobre o Projeto</span></button>
        <a href="index.html">↪ <span>Sair</span></a>
      </nav>

      <div class="sidebar-footer sidebar-footer-tema">
        <span class="tema-icone">☀️</span>
        <button id="btnTema" class="theme-switch" type="button" aria-label="Alternar tema"><span></span></button>
        <span class="tema-icone">🌙</span>
      </div>
    </aside>

    <header class="topbar">
      <div class="d-flex align-items-center gap-3 min-w-0">
        <button class="btn btn-icon d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#menuMobile">☰</button>
        <div class="min-w-0">
          <h1 class="topbar-title text-truncate">${cfg.titulo || 'Teologia Ninja'}</h1>
          ${cfg.subtitulo ? `<small class="topbar-subtitle d-none d-sm-block">${cfg.subtitulo}</small>` : ''}
        </div>
      </div>
      <div class="topbar-actions">
        <button class="btn btn-icon" type="button" title="Busca">🔎</button>
        <button class="btn btn-icon" type="button" title="Favoritos">❤️</button>
        <button class="btn btn-icon" type="button" title="Configurações" data-bs-toggle="offcanvas" data-bs-target="#configuracoesPainel">⚙️</button>
      </div>
    </header>

    <div class="offcanvas offcanvas-start app-offcanvas" id="menuMobile" tabindex="-1">
      <div class="offcanvas-header border-bottom">
        <div class="sidebar-brand mb-0"><div><strong>TEOLOGIA</strong><span>NINJA</span></div></div>
        <button class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body p-0">
        <nav class="sidebar-nav mobile-nav">
          ${menu}
          <div class="sidebar-divider"></div>
          <button class="sidebar-link-button" type="button" data-bs-toggle="offcanvas" data-bs-target="#configuracoesPainel">⚙️ <span>Configurações</span></button>
          <button class="sidebar-link-button" type="button" data-bs-toggle="modal" data-bs-target="#sobreModal">ℹ️ <span>Sobre o Projeto</span></button>
          <a href="index.html">↪ <span>Sair</span></a>
        </nav>
      </div>
    </div>

    <div class="offcanvas offcanvas-end painel-configuracoes" tabindex="-1" id="configuracoesPainel">
      <div class="offcanvas-header border-bottom">
        <h2 class="offcanvas-title h5 mb-0">Configurações</h2>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <h3 class="h6">Cor de destaque</h3>
        <p class="text-secondary small">A cor escolhida será usada em todo o sistema.</p>
        <div class="accent-options">
          <button class="accent-dot accent-purple" data-accent-option="purple" title="Roxo"></button>
          <button class="accent-dot accent-blue" data-accent-option="blue" title="Azul"></button>
          <button class="accent-dot accent-green" data-accent-option="green" title="Verde"></button>
          <button class="accent-dot accent-orange" data-accent-option="orange" title="Laranja"></button>
          <button class="accent-dot accent-red" data-accent-option="red" title="Vermelho"></button>
          <button class="accent-dot accent-gray" data-accent-option="gray" title="Cinza"></button>
        </div>
      </div>
    </div>

    <div class="modal fade" id="sobreModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content sobre-modal">
          <div class="modal-header">
            <h2 class="modal-title h5">Sobre o Projeto</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <h3 class="h5 accent-text">Teologia Ninja</h3>
            <p class="mb-1">Sistema de estudos bíblicos</p>
            <p class="text-secondary mb-0">Versão 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const alvo = document.getElementById('layoutSistema');
  if (!alvo) return;
  alvo.innerHTML = html;

  const validas = ['purple','blue','green','orange','red','gray'];

  function aplicarCor(cor) {
    const final = validas.includes(cor) ? cor : 'purple';
    document.documentElement.setAttribute('data-accent', final);
    localStorage.setItem('teologiaNinja_corDestaque', final);

    document.querySelectorAll('[data-accent-option]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.accentOption === final);
    });

    const meta = {
      purple:'#7c3aed',
      blue:'#0d8eff',
      green:'#00b83d',
      orange:'#ff8e00',
      red:'#ff3f45',
      gray:'#b8bec7'
    };

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', meta[final]);
    window.dispatchEvent(new CustomEvent('teologiaNinja:accentChange', { detail: { cor: final } }));
  }

  document.querySelectorAll('[data-accent-option]').forEach(btn => {
    btn.addEventListener('click', () => aplicarCor(btn.dataset.accentOption));
  });

  aplicarCor(localStorage.getItem('teologiaNinja_corDestaque') || 'purple');
})();