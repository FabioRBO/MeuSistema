(() => {
  'use strict';

  const estado = {
    dados: null,
    painel: null,
    comparativo: null,
    detalhe: null
  };

  const $ = seletor => document.querySelector(seletor);

  function criarCard(visao) {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6';

    col.innerHTML = `
      <article class="visao-card p-3 p-lg-4">
        <div class="visao-icone mb-3">${visao.icone}</div>
        <h3 class="h5">${visao.titulo}</h3>
        <p class="text-secondary">${visao.resumo}</p>
        <button class="btn btn-link p-0 visao-link" type="button" data-visao="${visao.id}">
          Abrir estudo
        </button>
      </article>
    `;

    return col;
  }

  function chips(lista, classe = 'nome-chip') {
    return lista.map(item => `<button class="${classe}" type="button" data-pessoa="${item}">${item}</button>`).join('');
  }

  function listaHtml(lista) {
    return `<ul class="mb-0">${lista.map(item => `<li class="mb-2">${item}</li>`).join('')}</ul>`;
  }

  function abrirVisao(id) {
    const visao = estado.dados.visoes.find(item => item.id === id);
    if (!visao) return;

    $('#tituloPainel').textContent = visao.titulo;
    $('#conteudoPainel').innerHTML = `
      <div class="text-center mb-4">
        <div class="display-5 mb-2">${visao.icone}</div>
        <h3 class="h3">${visao.titulo}</h3>
        <p class="text-secondary">${visao.resumo}</p>
      </div>

      <section class="info-bloco">
        <h3>Quando começou</h3>
        <p class="mb-0">${visao.quandoComecou}</p>
      </section>

      <section class="info-bloco">
        <h3>Autor ou autores importantes</h3>
        <div>${chips(visao.autores)}</div>
      </section>

      <section class="info-bloco">
        <h3>Quem importante acreditava</h3>
        <div>${chips(visao.nomesImportantes)}</div>
      </section>

      <section class="info-bloco">
        <h3>Versos bíblicos usados na interpretação</h3>
        <div>${visao.versos.map(ref => `<button class="verso-chip" type="button" data-verso="${ref}">${ref}</button>`).join('')}</div>
      </section>

      <section class="info-bloco">
        <h3>Descrição completa</h3>
        <p class="mb-0">${visao.descricao}</p>
      </section>

      <section class="info-bloco">
        <h3>Pontos defendidos</h3>
        ${listaHtml(visao.pontos)}
      </section>

      <section class="info-bloco">
        <h3>Cuidados e debates</h3>
        ${listaHtml(visao.cuidados)}
      </section>
    `;

    estado.painel.show();

    const url = new URL(location.href);
    url.searchParams.set('visao', id);
    history.replaceState(null, '', url);
  }


  function abrirPessoa(nome) {
    $('#detalheReferenciaTitulo').textContent = nome;
    $('#detalheReferenciaConteudo').innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-12 col-md-4 text-center">
          <div class="display-2 border rounded-4 p-4">👤</div>
          <p class="small text-secondary mt-2 mb-0">Imagem poderá ser adicionada depois.</p>
        </div>
        <div class="col-12 col-md-8">
          <h3 class="h4">${nome}</h3>
          <p>Nome relacionado a esta interpretação escatológica. Esta primeira versão deixa o painel pronto para receber biografia, datas, obras, fotografias e influência teológica.</p>
          <div class="detalhe-bloco">
            <strong>Próxima etapa</strong>
            <p class="mb-0 mt-2">Criar um JSON próprio de autores e ligar cada nome ao seu perfil completo.</p>
          </div>
        </div>
      </div>`;
    estado.detalhe.show();
  }

  function abrirVerso(referencia) {
    $('#detalheReferenciaTitulo').textContent = referencia;
    $('#detalheReferenciaConteudo').innerHTML = `
      <h3 class="h4">${referencia}</h3>
      <p class="text-secondary">A referência está pronta para integração com a Bíblia Interlinear.</p>
      <div class="detalhe-bloco mb-3">
        <strong>Texto bíblico</strong>
        <p class="mb-0 mt-2">O texto completo será carregado do módulo da Bíblia na próxima integração.</p>
      </div>
      <a class="btn btn-accent" href="biblia.html?ref=${encodeURIComponent(referencia)}">📖 Abrir na Bíblia</a>`;
    estado.detalhe.show();
  }

  async function iniciar() {
    try {
      estado.painel = new bootstrap.Offcanvas('#painelEscatologia');
      estado.comparativo = new bootstrap.Modal('#comparativoModal');
      estado.detalhe = new bootstrap.Modal('#detalheReferenciaModal');

      const resposta = await fetch('dados/escatologia.json');
      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
      estado.dados = await resposta.json();

      const lista = $('#listaVisoes');
      estado.dados.visoes.forEach(visao => lista.appendChild(criarCard(visao)));

      lista.addEventListener('click', evento => {
        const botao = evento.target.closest('[data-visao]');
        if (botao) abrirVisao(botao.dataset.visao);
      });

      $('#btnComparar').addEventListener('click', () => estado.comparativo.show());

      $('#conteudoPainel').addEventListener('click', evento => {
        const pessoa = evento.target.closest('[data-pessoa]');
        if (pessoa) {
          abrirPessoa(pessoa.dataset.pessoa);
          return;
        }

        const verso = evento.target.closest('[data-verso]');
        if (verso) abrirVerso(verso.dataset.verso);
      });

      $('#painelEscatologia').addEventListener('hidden.bs.offcanvas', () => {
        const url = new URL(location.href);
        url.searchParams.delete('visao');
        history.replaceState(null, '', url);
      });

      const visaoInicial = new URLSearchParams(location.search).get('visao');
      if (visaoInicial) abrirVisao(visaoInicial);
    } catch (erro) {
      console.error(erro);
      $('#listaVisoes').innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">
            Não foi possível carregar o módulo. Abra o projeto por um servidor local.
          </div>
        </div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();