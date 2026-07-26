const provedoresMapa = {
	osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '&copy; OpenStreetMap'
	}),

	topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
		maxZoom: 17,
		attribution: '&copy; OpenStreetMap | OpenTopoMap'
	}),

	satelite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		maxZoom: 19,
		attribution: '&copy; Esri'
	}),

	hibrido: L.layerGroup([
		L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 19,
			attribution: '&copy; Esri'
		}),

		L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 19,
			opacity: 0.9,
			attribution: '&copy; Esri'
		})
	]),

	dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
		subdomains: 'abcd',
		maxZoom: 20,
		attribution: '&copy; OpenStreetMap &copy; CARTO'
	}),

	light: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
		subdomains: 'abcd',
		maxZoom: 20,
		attribution: '&copy; OpenStreetMap &copy; CARTO'
	}),

	gray: L.layerGroup([
		L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 16,
			attribution: '&copy; Esri'
		}),

		L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
			maxZoom: 16,
			opacity: 0.9,
			attribution: '&copy; Esri'
		})
	]),

	terrain: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
		maxNativeZoom: 13,
		maxZoom: 19,
		attribution: '&copy; Esri'
	}),

	// watercolor: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg', {
	// 	maxNativeZoom: 16,
	// 	maxZoom: 19,
	// 	attribution: '&copy; Stadia Maps &copy; Stamen Design'
	// })
};