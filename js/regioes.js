// 1. MESOPOTÂMIA
adicionarRegiao([[37.2, 38.0], [37.5, 41.5], [36.8, 44.0], [35.2, 45.5], [32.8, 46.5], [30.0, 47.5], [29.0, 45.5], [31.0, 43.0], [33.0, 41.0], [35.0, 39.0]], 'Mesopotâmia — região aproximada', '#6a4c93', '1. Mesopotâmia');

// 2. ARAM / SÍRIA
adicionarRegiao([[37.2, 36.0], [37.3, 39.5], [35.8, 40.5], [33.0, 38.0], [32.5, 36.0], [34.0, 35.5], [36.0, 36.0]], 'Aram — Síria antiga', '#ff595e', '2. Aram');

// 3. CANAÃ
adicionarRegiao([[33.4, 35.1], [33.0, 35.7], [32.0, 35.6], [31.0, 35.5], [29.6, 35.0], [30.2, 34.5], [31.5, 34.3], [32.7, 34.7]], 'Canaã — Israel e Palestina', '#2a9d8f', '3. Canaã');

// 4. EGITO
adicionarRegiao([[31.7, 29.0], [31.7, 32.5], [30.0, 33.0], [27.0, 32.8], [24.0, 33.0], [22.0, 31.5], [24.0, 29.5], [27.0, 30.2], [29.5, 29.5]], 'Egito — vale e delta do Nilo', '#1982c4', '4. Egito');

// 5. PENÍNSULA DO SINAI
adicionarRegiao([[31.3, 32.5], [31.3, 34.2], [29.5, 34.9], [27.7, 34.3], [28.0, 33.2], [29.9, 32.5]], 'Sinai — região do Êxodo', '#b08900', '5. Sinai');

// 6. MIDIÃ / ARÁBIA
adicionarRegiao([[30.0, 34.5], [29.5, 36.5], [28.5, 38.0], [26.0, 38.5], [24.5, 37.0], [25.0, 35.0], [27.0, 34.5]], 'Midiã — noroeste da Arábia', '#ffd166', '6. Midiã');

// 7. FENÍCIA
adicionarRegiao([[34.8, 35.6], [34.6, 36.0], [33.0, 35.7], [32.8, 35.3], [33.8, 35.2]], 'Fenícia — região de Tiro e Sidom', '#8338ec', '7. Fenícia');

// 8. MOABE
adicionarRegiao([[32.0, 35.6], [32.0, 36.3], [31.0, 36.2], [30.5, 35.6]], 'Moabe — leste do mar Morto', '#a98467', '8. Moabe');

// 9. EDOM
adicionarRegiao([[30.6, 35.3], [30.5, 36.3], [29.0, 36.0], [28.5, 35.0], [29.5, 34.8]], 'Edom — sul da Transjordânia', '#e76f51', '9. Edom');

// 10. ARARATE
adicionarRegiao([[41.0, 42.0], [41.0, 46.0], [39.0, 46.5], [38.5, 43.0], [39.5, 42.0]], 'Região montanhosa de Ararate', '#4d908e', '10. Ararate');

// 11. ÁSIA MENOR
adicionarRegiao([[41.5, 26.0], [42.0, 35.0], [41.0, 41.5], [39.0, 43.0], [36.0, 36.0], [36.0, 29.0], [37.5, 26.0]], 'Ásia Menor — atual Turquia', '#ff006e', '11. Ásia Menor');

// 12. GRÉCIA
adicionarRegiao([[41.5, 20.0], [41.5, 24.8], [40.0, 25.5], [38.5, 24.0], [36.5, 23.0], [37.0, 21.0], [39.0, 20.0]], 'Grécia — Macedônia e Acaia', '#3a86ff', '12. Grécia');

// 13. ITÁLIA / ROMA
adicionarRegiao([[45.8, 7.0], [45.5, 13.5], [44.0, 13.0], [42.5, 14.5], [41.0, 16.5], [39.5, 17.0], [38.0, 15.5], [40.5, 14.0], [41.8, 12.0], [43.5, 10.0]], 'Itália — região de Roma', '#fb8500', '13. Itália');

// 14. ASSÍRIA / NÍNIVE
adicionarRegiao([[37.5, 41.5], [37.5, 44.5], [36.0, 45.0], [34.5, 44.0], [35.0, 41.5]], 'Assíria — região de Nínive', '#9d0208', '14. Assíria');

// 15. CHIPRE
L.circle([35.05, 33.2], { radius: 85000, ...estiloRegiao('#06d6a0') }).bindTooltip('<strong style="color:#06d6a0">15. Chipre</strong>', { permanent: true, direction: 'center', className: 'nome-regiao', interactive: false, opacity: 1 }).addTo(grupoPaises);

// 16. MALTA
L.circle([35.9, 14.4], { radius: 28000, ...estiloRegiao('#5c677d') }).bindTooltip('<strong style="color:#5c677d">16. Malta</strong>', { permanent: true, direction: 'center', className: 'nome-regiao', interactive: false, opacity: 1 }).addTo(grupoPaises);

// 17. ELÃO / PÉRSIA
adicionarRegiao([[34.0, 46.5], [34.5, 49.5], [33.0, 51.0], [30.0, 51.5], [28.0, 49.5], [29.0, 47.0], [31.0, 46.0]], 'Elão e Pérsia — região de Susã', '#7f5539', '17. Elão / Pérsia');