const centroInicial = [36.123, 28.456];
const zoomInicial = 5;

const mapa = L.map('meu_mapa', {
	zoomControl: false,
	zoomSnap: 0.25,
	zoomDelta: 0.25,
	wheelPxPerZoomLevel: 120
}).setView(centroInicial, zoomInicial);

L.control.zoom({
	position: 'bottomright',
	zoomInTitle: 'Aproximar',
	zoomOutTitle: 'Afastar'
}).addTo(mapa);

const nomesMapas = {
	osm: 'Mapa Padrão',
	topo: 'Mapa Topográfico',
	satelite: 'Satélite',
	hibrido: 'Satélite Híbrido',
	dark: 'Dark',
	light: 'Light',
	gray: 'Tons de Cinza',
	terrain: 'Terreno Físico',
	watercolor: 'Aquarela / Artístico'
};

function atualizarInformacoesMapa() {
	const centro = mapa.getCenter();
	const zoom = mapa.getZoom();
	const tipo = document.getElementById('seletor-mapa')?.value || 'osm';

	const elementoTipo = document.getElementById('info-tipo-mapa');
	const elementoZoom = document.getElementById('info-zoom');
	const elementoCoordenadas = document.getElementById('info-coordenadas');

	if (elementoTipo) {
		elementoTipo.textContent = nomesMapas[tipo] || 'Mapa';
	}

	if (elementoZoom) {
		elementoZoom.textContent = zoom.toFixed(2).replace(/\.00$/, '');
	}

	if (elementoCoordenadas) {
		elementoCoordenadas.textContent =
			`${centro.lat.toFixed(3)}, ${centro.lng.toFixed(3)}`;
	}
}

mapa.on('zoomend moveend', atualizarInformacoesMapa);

atualizarInformacoesMapa();