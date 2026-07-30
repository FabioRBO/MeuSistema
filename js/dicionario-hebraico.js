(()=>{'use strict';
const C={porPagina:9,favs:'teologiaNinja_dicionario_favoritos',idioma:'teologiaNinja_dicionario_idioma'};
const idiomas={
  hebraico:{arquivo:'dados/palavras-hebraicas.json',titulo:'Dicionário Hebraico',subtitulo:'Pesquise pelo hebraico, transliteração, português ou Strong.',placeholder:'Ex.: אדם, adam, humanidade ou H120',lang:'he',dir:'rtl',letras:['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'],vazio:'א'},
  grego:{arquivo:'dados/palavras-gregas.json',titulo:'Dicionário Grego',subtitulo:'Pesquise pelo grego, transliteração, português ou Strong.',placeholder:'Ex.: λόγος, logos, palavra ou G3056',lang:'grc',dir:'ltr',letras:['Α','Β','Γ','Δ','Ε','Ζ','Η','Θ','Ι','Κ','Λ','Μ','Ν','Ξ','Ο','Π','Ρ','Σ','Τ','Υ','Φ','Χ','Ψ','Ω'],vazio:'Ω'}
};
const E={palavras:[],filtradas:[],pagina:1,letra:'',soFav:false,painel:null,idioma:'hebraico'};
const $=s=>document.querySelector(s);
const norm=(s='')=>String(s).normalize('NFD').replace(/[\u0300-\u036f\u0591-\u05C7]/g,'').toLowerCase().trim();
const ler=()=>{try{const a=JSON.parse(localStorage.getItem(C.favs)||'[]');return Array.isArray(a)?a:[]}catch{return[]}};
const favorito=id=>ler().includes(id);
function original(x){return x.hebraico||x.original||''}
function semSinais(x){return x.semPontos||x.semSinais||original(x)}
function alternar(id){const a=ler(),i=a.indexOf(id);i>=0?a.splice(i,1):a.unshift(id);localStorage.setItem(C.favs,JSON.stringify(a));atualizarFavs();filtrar();const p=E.palavras.find(x=>x.id===id);if(p&&$('#painelPalavra').classList.contains('show'))detalhe(p)}
function atualizarFavs(){$('#totalFavoritos').textContent=ler().length;$('#btnFavoritos').classList.toggle('active',E.soFav);$('#btnFavoritos').firstChild.textContent=E.soFav?'♥ Favoritos ':'♡ Favoritos '}
function categorias(){$('#categoria').innerHTML='<option value="">Todas as categorias</option>';[...new Set(E.palavras.map(x=>x.categoria))].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(c=>$('#categoria').insertAdjacentHTML('beforeend',`<option>${c}</option>`))}
function alfabeto(){const cfg=idiomas[E.idioma];$('#alfabeto').innerHTML='<button class="btn btn-sm btn-outline-secondary letra-hebraica active" data-letra="" style="min-width:4.3rem">Todos</button>'+cfg.letras.map(l=>`<button class="btn btn-sm btn-outline-secondary letra-hebraica" data-letra="${l}">${l}</button>`).join('')}
function atualizarCabecalho(){const cfg=idiomas[E.idioma];$('#tituloDicionario').textContent=cfg.titulo;$('#subtituloDicionario').textContent=cfg.subtitulo;$('#busca').placeholder=cfg.placeholder;$('#rotuloPainel').textContent=cfg.titulo;document.title=`${cfg.titulo} | Teologia Ninja`}
function filtrar(){const q=norm($('#busca').value),cat=$('#categoria').value,f=ler();E.filtradas=E.palavras.filter(x=>{const t=norm([x.id,original(x),semSinais(x),x.transliteracao,x.pronuncia,x.portugues,x.raiz,x.resumo,x.significado].join(' '));return(!q||t.includes(q))&&(!cat||x.categoria===cat)&&(!E.letra||norm(semSinais(x)).startsWith(norm(E.letra)))&&(!E.soFav||f.includes(x.id))});E.filtradas.sort((a,b)=>Number(a.id.slice(1))-Number(b.id.slice(1)));E.pagina=Math.min(E.pagina,Math.max(1,Math.ceil(E.filtradas.length/C.porPagina)));render();url()}
function render(){const cfg=idiomas[E.idioma],ini=(E.pagina-1)*C.porPagina,pag=E.filtradas.slice(ini,ini+C.porPagina);$('#lista').innerHTML=pag.length?pag.map(x=>`<div class="col-12 col-md-6 col-xl-4"><article class="card palavra-card" tabindex="0" data-id="${x.id}"><div class="card-body"><div class="d-flex justify-content-between gap-3"><div><div class="palavra-hebraico mb-1" lang="${cfg.lang}" dir="${cfg.dir}">${original(x)}</div><div class="fw-semibold">${x.transliteracao}</div></div><button class="btn btn-outline-secondary btn-favorito ${favorito(x.id)?'ativo':''}" data-favorito="${x.id}">${favorito(x.id)?'♥':'♡'}</button></div><div class="palavra-portugues mt-3">${x.portugues}</div><div class="d-flex flex-wrap gap-2 mt-3"><span class="badge rounded-pill text-bg-accent">${x.id}</span><span class="badge rounded-pill text-bg-secondary">${x.categoria}</span><span class="badge rounded-pill border text-body">${x.ocorrencias} ocorrências</span></div><p class="small text-secondary mt-3 mb-0">${x.resumo}</p></div></article></div>`).join(''):`<div class="col-12"><div class="text-center py-5 border rounded-4"><div class="display-5 mb-3">${cfg.vazio}</div><h2 class="h5">Nenhuma palavra encontrada</h2><p class="text-secondary mb-0">Tente outra busca, letra ou categoria.</p></div></div>`;$('#resumo').textContent=`${E.filtradas.length} palavra${E.filtradas.length===1?'':'s'} encontrada${E.filtradas.length===1?'':'s'}`;$('#verTodas').classList.toggle('d-none',!E.soFav&&!E.letra&&!$('#busca').value&&!$('#categoria').value);paginacao()}
function paginacao(){const t=Math.ceil(E.filtradas.length/C.porPagina);if(t<=1){$('#paginacao').innerHTML='';return}let h=`<li class="page-item ${E.pagina===1?'disabled':''}"><button class="page-link" data-pagina="${E.pagina-1}">‹</button></li>`;for(let p=1;p<=t;p++)h+=`<li class="page-item ${p===E.pagina?'active':''}"><button class="page-link" data-pagina="${p}">${p}</button></li>`;h+=`<li class="page-item ${E.pagina===t?'disabled':''}"><button class="page-link" data-pagina="${E.pagina+1}">›</button></li>`;$('#paginacao').innerHTML=h}
function detalhe(x){const cfg=idiomas[E.idioma];$('#tituloPainel').textContent=`${x.id} — ${x.transliteracao}`;$('#conteudoPalavra').innerHTML=`<div class="text-center mb-4"><div class="detalhe-hebraico" lang="${cfg.lang}" dir="${cfg.dir}">${original(x)}</div><h3 class="h4 mb-1">${x.transliteracao}</h3><div class="text-secondary">${x.pronuncia}</div><div class="fs-5 mt-2">${x.portugues}</div><button class="btn ${favorito(x.id)?'btn-danger':'btn-outline-accent'} mt-3" data-favorito="${x.id}">${favorito(x.id)?'♥ Remover dos favoritos':'♡ Adicionar aos favoritos'}</button></div><div class="row g-2 mb-3"><div class="col-6"><div class="detalhe-bloco h-100"><small class="text-secondary d-block">Strong</small><strong>${x.id}</strong></div></div><div class="col-6"><div class="detalhe-bloco h-100"><small class="text-secondary d-block">Raiz</small><strong lang="${cfg.lang}" dir="${cfg.dir}">${x.raiz}</strong></div></div><div class="col-6"><div class="detalhe-bloco h-100"><small class="text-secondary d-block">Classe</small><strong>${x.classe}</strong></div></div><div class="col-6"><div class="detalhe-bloco h-100"><small class="text-secondary d-block">Ocorrências</small><strong>${x.ocorrencias}</strong></div></div></div><h4 class="h6 text-uppercase text-secondary">Significado</h4><p>${x.significado}</p><h4 class="h6 text-uppercase text-secondary mt-4">Primeira ocorrência</h4><p>${x.primeiraOcorrencia}</p><h4 class="h6 text-uppercase text-secondary mt-4">Referências de exemplo</h4><div>${x.referencias.map(r=>`<a class="referencia-chip" href="biblia.html?ref=${encodeURIComponent(r)}">${r}</a>`).join('')}</div><div class="d-grid mt-4"><a class="btn btn-accent" href="biblia.html?strong=${x.id}">📖 Ver na Bíblia Interlinear</a></div>`}
function abrir(id,upd=true){const x=E.palavras.find(p=>p.id===id);if(!x)return;detalhe(x);E.painel.show();if(upd){const u=new URL(location.href);u.searchParams.set('id',id);history.replaceState(null,'',u)}}
function url(){const u=new URL(location.href),q=$('#busca').value.trim(),c=$('#categoria').value;q?u.searchParams.set('q',q):u.searchParams.delete('q');c?u.searchParams.set('cat',c):u.searchParams.delete('cat');E.letra?u.searchParams.set('letra',E.letra):u.searchParams.delete('letra');E.soFav?u.searchParams.set('fav','1'):u.searchParams.delete('fav');u.searchParams.set('idioma',E.idioma);history.replaceState(null,'',u)}
function limpar(){E.letra='';E.soFav=false;E.pagina=1;$('#busca').value='';$('#categoria').value='';document.querySelectorAll('[data-letra]').forEach(b=>b.classList.toggle('active',b.dataset.letra===''));atualizarFavs();filtrar()}
async function carregarIdioma(idioma){E.idioma=idiomas[idioma]?idioma:'hebraico';localStorage.setItem(C.idioma,E.idioma);E.pagina=1;E.letra='';$('#busca').value='';$('#categoria').value='';atualizarCabecalho();alfabeto();const r=await fetch(idiomas[E.idioma].arquivo);if(!r.ok)throw new Error(r.status);const d=await r.json();E.palavras=d.palavras||d;categorias();filtrar()}
function eventos(){$('#busca').addEventListener('input',()=>{E.pagina=1;filtrar()});$('#limparBusca').onclick=()=>{$('#busca').value='';filtrar();$('#busca').focus()};$('#categoria').onchange=()=>{E.pagina=1;filtrar()};$('#idioma').onchange=()=>carregarIdioma($('#idioma').value).catch(mostrarErro);$('#btnFavoritos').onclick=()=>{E.soFav=!E.soFav;E.pagina=1;atualizarFavs();filtrar()};$('#verTodas').onclick=limpar;$('#alfabeto').onclick=e=>{const b=e.target.closest('[data-letra]');if(!b)return;E.letra=b.dataset.letra;E.pagina=1;document.querySelectorAll('[data-letra]').forEach(x=>x.classList.toggle('active',x===b));filtrar()};$('#lista').onclick=e=>{const f=e.target.closest('[data-favorito]');if(f){e.stopPropagation();alternar(f.dataset.favorito);return}const c=e.target.closest('[data-id]');if(c)abrir(c.dataset.id)};$('#conteudoPalavra').onclick=e=>{const f=e.target.closest('[data-favorito]');if(f)alternar(f.dataset.favorito)};$('#paginacao').onclick=e=>{const b=e.target.closest('[data-pagina]');if(!b||b.closest('.disabled'))return;E.pagina=Number(b.dataset.pagina);render();scrollTo({top:0,behavior:'smooth'})};$('#painelPalavra').addEventListener('hidden.bs.offcanvas',()=>{const u=new URL(location.href);u.searchParams.delete('id');history.replaceState(null,'',u)})}
function mostrarErro(e){console.error(e);$('#mensagem').className='alert alert-danger';$('#mensagem').textContent='Não foi possível carregar o JSON. Abra o projeto por um servidor local, por exemplo: php -S localhost:8000.'}
async function iniciar(){try{E.painel=new bootstrap.Offcanvas('#painelPalavra');eventos();const p=new URLSearchParams(location.search);const idioma=p.get('idioma')||localStorage.getItem(C.idioma)||'hebraico';$('#idioma').value=idioma;E.soFav=p.get('fav')==='1';atualizarFavs();await carregarIdioma(idioma);$('#busca').value=p.get('q')||'';$('#categoria').value=p.get('cat')||'';E.letra=p.get('letra')||'';document.querySelectorAll('[data-letra]').forEach(b=>b.classList.toggle('active',b.dataset.letra===E.letra));filtrar();if(p.get('id'))abrir(p.get('id').toUpperCase(),false)}catch(e){mostrarErro(e)}}
document.addEventListener('DOMContentLoaded',iniciar)})();const ALFABETOS = {
    hebraico: [
      { letra: 'א', nome: 'Álef' },
      { letra: 'ב', nome: 'Bet' },
      { letra: 'ג', nome: 'Guímel' },
      { letra: 'ד', nome: 'Dálet' },
      { letra: 'ה', nome: 'He' },
      { letra: 'ו', nome: 'Vav' },
      { letra: 'ז', nome: 'Záin' },
      { letra: 'ח', nome: 'Chet' },
      { letra: 'ט', nome: 'Tet' },
      { letra: 'י', nome: 'Yod' },
      { letra: 'כ', nome: 'Kaf' },
      { letra: 'ל', nome: 'Lâmed' },
      { letra: 'מ', nome: 'Mem' },
      { letra: 'נ', nome: 'Nun' },
      { letra: 'ס', nome: 'Sâmech' },
      { letra: 'ע', nome: 'Áyin' },
      { letra: 'פ', nome: 'Pe' },
      { letra: 'צ', nome: 'Tsádi' },
      { letra: 'ק', nome: 'Qof' },
      { letra: 'ר', nome: 'Resh' },
      { letra: 'ש', nome: 'Shin' },
      { letra: 'ת', nome: 'Tav' }
    ],
    grego: [
      { letra: 'Α', nome: 'Alfa' },
      { letra: 'Β', nome: 'Beta' },
      { letra: 'Γ', nome: 'Gama' },
      { letra: 'Δ', nome: 'Delta' },
      { letra: 'Ε', nome: 'Épsilon' },
      { letra: 'Ζ', nome: 'Zeta' },
      { letra: 'Η', nome: 'Eta' },
      { letra: 'Θ', nome: 'Teta' },
      { letra: 'Ι', nome: 'Iota' },
      { letra: 'Κ', nome: 'Kapa' },
      { letra: 'Λ', nome: 'Lambda' },
      { letra: 'Μ', nome: 'Mi' },
      { letra: 'Ν', nome: 'Ni' },
      { letra: 'Ξ', nome: 'Xi' },
      { letra: 'Ο', nome: 'Ômicron' },
      { letra: 'Π', nome: 'Pi' },
      { letra: 'Ρ', nome: 'Rô' },
      { letra: 'Σ', nome: 'Sigma' },
      { letra: 'Τ', nome: 'Tau' },
      { letra: 'Υ', nome: 'Ípsilon' },
      { letra: 'Φ', nome: 'Fi' },
      { letra: 'Χ', nome: 'Chi' },
      { letra: 'Ψ', nome: 'Psi' },
      { letra: 'Ω', nome: 'Ômega' }
    ]
  };

  
