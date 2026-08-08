(() => {
  const svg = d3.select('#grafoBiblico');
  const painel = document.getElementById('grafoInfo');
  const conteudo = document.getElementById('grafoInfoConteudo');
  let simulation, zoom;

  const cores = { tema:'#84cc16', passagem:'#22d3a6', subtema:'#f0c878' };
  const raio = d => d.tipo === 'tema' ? 14 : d.tipo === 'subtema' ? 9 : 6;

  fetch('dados/conexoes-biblicas.json')
    .then(r => r.json())
    .then(dados => montar(dados))
    .catch(err => console.error('Erro ao carregar conexões bíblicas:', err));

  function montar(data) {
    const el = document.getElementById('grafoBiblico');
    const width = el.clientWidth;
    const height = el.clientHeight;
    svg.attr('viewBox', [0,0,width,height]);

    const root = svg.append('g');
    const links = root.append('g').selectAll('line').data(data.links).join('line').attr('class','link');
    const nodes = root.append('g').selectAll('circle').data(data.nodes).join('circle')
      .attr('class','node').attr('r',raio).attr('fill',d => cores[d.tipo] || '#999')
      .on('click',(e,d) => abrir(d, data))
      .call(d3.drag().on('start',dragstarted).on('drag',dragged).on('end',dragended));

    const labels = root.append('g').selectAll('text').data(data.nodes).join('text')
      .attr('class','node-label').attr('dx',d => raio(d)+6).attr('dy','.35em').text(d => d.titulo);

    simulation = d3.forceSimulation(data.nodes)
      .force('link',d3.forceLink(data.links).id(d=>d.id).distance(d => d.source.tipo === 'tema' ? 115 : 85))
      .force('charge',d3.forceManyBody().strength(-250))
      .force('center',d3.forceCenter(width/2,height/2))
      .force('collision',d3.forceCollide().radius(d => raio(d)+34))
      .on('tick',()=>{
        links.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y);
        nodes.attr('cx',d=>d.x).attr('cy',d=>d.y);
        labels.attr('x',d=>d.x).attr('y',d=>d.y);
      });

    zoom = d3.zoom().scaleExtent([.25,4]).on('zoom',e=>root.attr('transform',e.transform));
    svg.call(zoom);

    document.getElementById('btnCentralizar').onclick = () => svg.transition().duration(350).call(zoom.transform,d3.zoomIdentity);
    document.getElementById('buscaGrafo').addEventListener('input',e=>{
      const q = e.target.value.toLowerCase().trim();
      nodes.attr('opacity',d => !q || d.titulo.toLowerCase().includes(q) ? 1 : .14);
      labels.attr('opacity',d => !q || d.titulo.toLowerCase().includes(q) ? 1 : .12);
    });

    function dragstarted(e,d){if(!e.active) simulation.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y}
    function dragged(e,d){d.fx=e.x;d.fy=e.y}
    function dragended(e,d){if(!e.active) simulation.alphaTarget(0);d.fx=null;d.fy=null}
  }

  function abrir(d, data) {
    const ligados = data.links.filter(l => (l.source.id||l.source)===d.id || (l.target.id||l.target)===d.id)
      .map(l => (l.source.id||l.source)===d.id ? l.target : l.source);
    conteudo.innerHTML = `
      <small class="accent-text text-uppercase">${d.tipo}</small>
      <h2 class="h4 mt-2">${d.titulo}</h2>
      ${d.descricao ? `<p class="text-secondary">${d.descricao}</p>` : ''}
      ${d.referencia ? `<p><strong>Referência:</strong> ${d.referencia}</p><a class="btn btn-outline-accent btn-sm" href="biblia-leitura.html">📖 Abrir Bíblia</a>` : ''}
      <hr><h3 class="h6">Conexões</h3>
      <div class="d-flex flex-wrap gap-2">${ligados.map(x=>`<span class="badge text-bg-secondary">${x.titulo}</span>`).join('')}</div>`;
    painel.classList.add('aberto');
  }
  document.getElementById('fecharInfo').onclick = () => painel.classList.remove('aberto');
})();