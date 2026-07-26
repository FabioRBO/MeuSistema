const estadoBiblia = {
  livro: "genesis",
  dadosLivro: null,
  capitulo: 1,
  versiculo: 1,
  modo: "cartoes",
  fonte: 100,
  palavraSelecionada: 0,
  tabelaCompacta: false
};

const cacheLivros = new Map();

const elLivro = document.getElementById("livro");
const elCapitulo = document.getElementById("capitulo");
const elVersiculo = document.getElementById("versiculo");
const elTitulo = document.getElementById("tituloPassagem");
const elConteudo = document.getElementById("conteudoBiblico");
const elDetalhe = document.getElementById("detalhePalavra");
const elFonteAtual = document.getElementById("fonteAtual");
const elBibleLayout = document.getElementById("bibleLayout");
const elCompactTableOption = document.getElementById("compactTableOption");
const elTabelaCompacta = document.getElementById("tabelaCompacta");
const elPaginacao = document.getElementById("paginacaoVersiculos");
const elMensagem = document.getElementById("mensagemBiblia");

function mostrarMensagem(texto, tipo = "info") {
  elMensagem.className = `alert alert-${tipo} mb-3`;
  elMensagem.textContent = texto;
}

function ocultarMensagem() {
  elMensagem.className = "alert d-none mb-3";
  elMensagem.textContent = "";
}

function classeIdioma(idioma) {
  return idioma === "hebraico" ? "hebraico" : "grego";
}

function obterRegistroLivro(idLivro) {
  return LIVROS_BIBLIA.find(livro => livro.id === idLivro);
}

async function carregarLivro(idLivro) {
  if (cacheLivros.has(idLivro)) {
    return cacheLivros.get(idLivro);
  }

  const registro = obterRegistroLivro(idLivro);

  if (!registro) {
    throw new Error(`Livro não encontrado no catálogo: ${idLivro}`);
  }

  const resposta = await fetch(registro.arquivo, { cache: "no-cache" });

  if (!resposta.ok) {
    throw new Error(
      `Não foi possível carregar ${registro.nome} (${resposta.status}).`
    );
  }

  const dados = await resposta.json();
  cacheLivros.set(idLivro, dados);

  return dados;
}

function preencherLivros() {
  const livrosOrdenados = [...LIVROS_BIBLIA].sort(
    (a, b) => a.ordem - b.ordem
  );

  const antigoTestamento = livrosOrdenados.filter(
    livro => livro.testamento === "antigo"
  );

  const novoTestamento = livrosOrdenados.filter(
    livro => livro.testamento === "novo"
  );

  function criarOpcoes(livros) {
    return livros.map(livro => {
      const numero = String(livro.ordem).padStart(2, "0");

      return `
        <option value="${livro.id}">
          ${numero} - ${livro.nome}
        </option>
      `;
    }).join("");
  }

  elLivro.innerHTML = `
    <optgroup label="Antigo Testamento">
      ${criarOpcoes(antigoTestamento)}
    </optgroup>
    <optgroup label="Novo Testamento">
      ${criarOpcoes(novoTestamento)}
    </optgroup>
  `;

  elLivro.value = estadoBiblia.livro;
}

function obterCapitulos() {
  return Object.keys(estadoBiblia.dadosLivro?.capitulos || {})
    .map(Number)
    .sort((a, b) => a - b);
}

function obterVersiculos() {
  const capitulo =
    estadoBiblia.dadosLivro?.capitulos?.[String(estadoBiblia.capitulo)];

  return Object.keys(capitulo?.versiculos || {})
    .map(Number)
    .sort((a, b) => a - b);
}

function preencherCapitulos() {
  const capitulos = obterCapitulos();

  if (!capitulos.length) {
    throw new Error("O livro não possui capítulos disponíveis.");
  }

  if (!capitulos.includes(Number(estadoBiblia.capitulo))) {
    estadoBiblia.capitulo = capitulos[0];
  }

  elCapitulo.innerHTML = capitulos
    .map(numero => `<option value="${numero}">${numero}</option>`)
    .join("");

  elCapitulo.value = String(estadoBiblia.capitulo);
}

function preencherVersiculos() {
  const versiculos = obterVersiculos();

  if (!versiculos.length) {
    throw new Error("O capítulo não possui versículos disponíveis.");
  }

  if (!versiculos.includes(Number(estadoBiblia.versiculo))) {
    estadoBiblia.versiculo = versiculos[0];
  }

  elVersiculo.innerHTML = versiculos
    .map(numero => `<option value="${numero}">${numero}</option>`)
    .join("");

  elVersiculo.value = String(estadoBiblia.versiculo);
}

function obterConteudoAtual() {
  const capitulo =
    estadoBiblia.dadosLivro.capitulos[String(estadoBiblia.capitulo)];

  const versiculo =
    capitulo.versiculos[String(estadoBiblia.versiculo)];

  if (!versiculo) {
    throw new Error("Versículo não encontrado.");
  }

  // Formato canônico: { traducaoLiteral, palavras }
  if (Array.isArray(versiculo)) {
    return {
      livro: estadoBiblia.dadosLivro,
      palavras: versiculo,
      traducaoLiteral: ""
    };
  }

  return {
    livro: estadoBiblia.dadosLivro,
    palavras: versiculo.palavras || [],
    traducaoLiteral: versiculo.traducaoLiteral || ""
  };
}

function renderizarDetalhe(indice) {
  const { livro, palavras } = obterConteudoAtual();
  const p = palavras[indice];

  if (!p) {
    elDetalhe.innerHTML = '<p class="text-secondary mb-0">Selecione uma palavra.</p>';
    return;
  }

  const classe = classeIdioma(livro.idioma);
  estadoBiblia.palavraSelecionada = indice;

  elDetalhe.innerHTML = `
    <div class="detail-original ${classe}">${p.original || ""}</div>
    <div class="detail-translit">${p.transliteracao || ""}</div>
    <div>${p.portugues || ""}</div>
    <hr>
    <p><strong>Strong:</strong>
      <span class="accent-text">${p.strong || "—"}</span>
    </p>
    <p><strong>Lema:</strong> ${p.lema || "—"}</p>
    <p><strong>Pronúncia:</strong> ${p.pronuncia || "—"}</p>
    <p><strong>Significado:</strong> ${p.significado || p.portugues || "—"}</p>
    ${p.morfologia ? `<p><strong>Morfologia:</strong> ${p.morfologia}</p>` : ""}
    <button class="btn btn-outline-accent w-100 mb-2">Ver detalhes</button>
    <button class="btn btn-outline-accent w-100">Adicionar aos favoritos ♡</button>
  `;

  document
    .querySelectorAll(".word-row, .grid-word-card")
    .forEach((item, i) => {
      item.classList.toggle("active", i === indice);
    });
}

function renderizarCartoes(livro, palavras) {
  const classe = classeIdioma(livro.idioma);

  elConteudo.innerHTML = `
    <div class="words-list">
      ${palavras.map((p, i) => `
        <article
          class="word-row ${i === estadoBiblia.palavraSelecionada ? "active" : ""}"
          data-indice="${i}"
        >
          <div class="word-number">${i + 1}</div>

          <div>
            <div class="word-original ${classe}">${p.original || ""}</div>
            <div class="word-meta">
              <span class="strong-tag">${p.strong || "—"}</span>
              <button class="mini-action" type="button">🔊</button>
            </div>
          </div>

          <div class="word-translit">${p.transliteracao || ""}</div>
          <div class="word-portuguese">${p.portugues || ""}</div>

          <div class="word-actions">
            <button class="mini-action" type="button">♡</button>
            <button class="mini-action" type="button">⋮</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".word-row").forEach(row => {
    row.addEventListener("click", () => {
      renderizarDetalhe(Number(row.dataset.indice));
    });
  });
}

function renderizarGrade(livro, palavras) {
  const classe = classeIdioma(livro.idioma);

  elConteudo.innerHTML = `
    <div class="cards-grid">
      ${palavras.map((p, i) => `
        <article
          class="grid-word-card ${i === estadoBiblia.palavraSelecionada ? "active" : ""}"
          data-indice="${i}"
        >
          <div class="grid-card-number">${i + 1}</div>
          <div class="grid-card-original ${classe}">${p.original || ""}</div>
          <div class="grid-card-translit">${p.transliteracao || ""}</div>
          <div class="grid-card-portuguese">${p.portugues || ""}</div>

          <div class="grid-card-footer">
            <span class="strong-tag">${p.strong || "—"}</span>
            <div class="word-actions">
              <button class="mini-action" type="button">🔊</button>
              <button class="mini-action" type="button">♡</button>
            </div>
          </div>
        </article>
      `).join("")}
    </div>
  `;

  document.querySelectorAll(".grid-word-card").forEach(card => {
    card.addEventListener("click", () => {
      renderizarDetalhe(Number(card.dataset.indice));
    });
  });
}

function renderizarLinhas(livro, palavras, traducaoLiteral) {
  const classe = classeIdioma(livro.idioma);
  const portugues =
    traducaoLiteral ||
    palavras.map(p => p.portugues || "").join(" ");

  elConteudo.innerHTML = `
    <article class="line-mode-card">
      <div class="line-original ${classe}">
        ${palavras.map(p => p.original || "").join(" ")}
      </div>
      <hr>
      <div class="line-translit">
        ${palavras.map(p => p.transliteracao || "").join(" ")}
      </div>
      <hr>
      <div class="line-portuguese">${portugues}</div>
    </article>
  `;
}

function renderizarTabela(livro, palavras) {
  const classe = classeIdioma(livro.idioma);

  elConteudo.innerHTML = `
    <div class="table-mode-wrap table-responsive ${
      estadoBiblia.tabelaCompacta ? "table-compacta" : ""
    }">
      <table class="table align-middle mb-0">
        <thead>
          <tr>
            <th>#</th>
            <th>Original</th>
            <th>Transliteração</th>
            <th>Português</th>
            <th>Strong</th>
          </tr>
        </thead>
        <tbody>
          ${palavras.map((p, i) => `
            <tr role="button" data-indice="${i}">
              <td>${i + 1}</td>
              <td class="word-original ${classe}">${p.original || ""}</td>
              <td>${p.transliteracao || ""}</td>
              <td>${p.portugues || ""}</td>
              <td>${p.strong || "—"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  elConteudo.querySelectorAll("tbody tr").forEach(row => {
    row.addEventListener("click", () => {
      renderizarDetalhe(Number(row.dataset.indice));
    });
  });
}

function renderizarPaginacao() {
  const versiculos = obterVersiculos();
  const atual = Number(estadoBiblia.versiculo);
  const indiceAtual = versiculos.indexOf(atual);
  const anterior = versiculos[indiceAtual - 1];
  const proximo = versiculos[indiceAtual + 1];

  const janela = versiculos.filter(numero => Math.abs(numero - atual) <= 2);

  elPaginacao.innerHTML = `
    <button type="button" data-versiculo="${anterior || ""}" ${anterior ? "" : "disabled"}>«</button>
    ${janela.map(numero => `
      <button
        type="button"
        data-versiculo="${numero}"
        class="${numero === atual ? "active" : ""}"
      >${numero}</button>
    `).join("")}
    <button type="button" data-versiculo="${proximo || ""}" ${proximo ? "" : "disabled"}>»</button>
  `;

  elPaginacao.querySelectorAll("button[data-versiculo]").forEach(botao => {
    botao.addEventListener("click", () => {
      const numero = Number(botao.dataset.versiculo);
      if (!numero) return;

      estadoBiblia.versiculo = numero;
      estadoBiblia.palavraSelecionada = 0;
      elVersiculo.value = String(numero);
      renderizar();
    });
  });
}

function renderizar() {
  const { livro, palavras, traducaoLiteral } = obterConteudoAtual();

  if (!palavras.length) {
    throw new Error("O versículo não possui palavras cadastradas.");
  }

  elBibleLayout.classList.toggle(
    "modo-linhas",
    estadoBiblia.modo === "linhas"
  );
  elBibleLayout.classList.toggle(
    "modo-grade",
    estadoBiblia.modo === "grade"
  );
  elBibleLayout.classList.toggle(
    "modo-tabela",
    estadoBiblia.modo === "tabela"
  );

  elCompactTableOption.classList.toggle(
    "d-none",
    estadoBiblia.modo !== "tabela"
  );

  elTitulo.textContent =
    `${livro.livro} ${estadoBiblia.capitulo}:${estadoBiblia.versiculo}`;

  elConteudo.style.setProperty(
    "--biblia-font-scale",
    (estadoBiblia.fonte / 100).toFixed(2)
  );

  if (estadoBiblia.modo === "linhas") {
    renderizarLinhas(livro, palavras, traducaoLiteral);
  } else if (estadoBiblia.modo === "grade") {
    renderizarGrade(livro, palavras);
  } else if (estadoBiblia.modo === "tabela") {
    renderizarTabela(livro, palavras);
  } else {
    renderizarCartoes(livro, palavras);
  }

  estadoBiblia.palavraSelecionada = Math.min(
    estadoBiblia.palavraSelecionada,
    palavras.length - 1
  );

  renderizarDetalhe(estadoBiblia.palavraSelecionada);
  renderizarPaginacao();
}

function mudarModo(modo) {
  estadoBiblia.modo = modo;

  document.querySelectorAll("[data-modo]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.modo === modo);
  });

  renderizar();
}

function aplicarCorDestaque(cor) {
  document.documentElement.setAttribute("data-accent", cor);
  localStorage.setItem("teologiaNinja_corDestaque", cor);

  document.querySelectorAll("[data-accent-option]").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.accentOption === cor
    );
  });

  const meta = document.querySelector('meta[name="theme-color"]');

  if (meta) {
    const cores = {
      purple: "#7c3aed",
      blue: "#0d8eff",
      green: "#00b83d",
      orange: "#ff8e00",
      red: "#ff3f45",
      gray: "#b8bec7"
    };

    meta.setAttribute("content", cores[cor] || cores.purple);
  }
}

async function selecionarLivro(idLivro) {
  mostrarMensagem("Carregando livro...", "info");

  estadoBiblia.livro = idLivro;
  estadoBiblia.capitulo = 1;
  estadoBiblia.versiculo = 1;
  estadoBiblia.palavraSelecionada = 0;

  estadoBiblia.dadosLivro = await carregarLivro(idLivro);

  preencherCapitulos();
  preencherVersiculos();
  ocultarMensagem();
  renderizar();
}

elLivro.addEventListener("change", async evento => {
  try {
    await selecionarLivro(evento.target.value);
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message, "danger");
  }
});

elCapitulo.addEventListener("change", evento => {
  try {
    estadoBiblia.capitulo = Number(evento.target.value);
    estadoBiblia.versiculo = 1;
    estadoBiblia.palavraSelecionada = 0;

    preencherVersiculos();
    renderizar();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message, "danger");
  }
});

elVersiculo.addEventListener("change", evento => {
  try {
    estadoBiblia.versiculo = Number(evento.target.value);
    estadoBiblia.palavraSelecionada = 0;
    renderizar();
  } catch (erro) {
    console.error(erro);
    mostrarMensagem(erro.message, "danger");
  }
});

document.querySelectorAll("[data-modo]").forEach(btn => {
  btn.addEventListener("click", () => mudarModo(btn.dataset.modo));
});

elTabelaCompacta.addEventListener("change", () => {
  estadoBiblia.tabelaCompacta = elTabelaCompacta.checked;

  if (estadoBiblia.modo === "tabela") {
    renderizar();
  }
});

document.querySelectorAll("[data-accent-option]").forEach(btn => {
  btn.addEventListener("click", () => {
    aplicarCorDestaque(btn.dataset.accentOption);
  });
});

document.getElementById("fonteMenos").addEventListener("click", () => {
  estadoBiblia.fonte = Math.max(80, estadoBiblia.fonte - 10);
  elFonteAtual.textContent = `${estadoBiblia.fonte}%`;
  renderizar();
});

document.getElementById("fonteMais").addEventListener("click", () => {
  estadoBiblia.fonte = Math.min(160, estadoBiblia.fonte + 10);
  elFonteAtual.textContent = `${estadoBiblia.fonte}%`;
  renderizar();
});

document.getElementById("fonteAtual").addEventListener("click", () => {
  estadoBiblia.fonte = 100;
  elFonteAtual.textContent = "100%";
  renderizar();
});

async function iniciarBiblia() {
  try {
    preencherLivros();
    aplicarCorDestaque(
      localStorage.getItem("teologiaNinja_corDestaque") || "purple"
    );

    await selecionarLivro(estadoBiblia.livro);
  } catch (erro) {
    console.error(erro);

    const mensagemArquivo =
      window.location.protocol === "file:"
        ? " Abra o projeto pelo Laragon ou por outro servidor local."
        : "";

    mostrarMensagem(
      `${erro.message}${mensagemArquivo}`,
      "danger"
    );
  }
}

iniciarBiblia();
