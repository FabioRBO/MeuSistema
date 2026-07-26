/*
  Preparação para PWA.

  O service worker ainda NÃO é registrado.
  Quando o sistema estiver mais maduro, basta ativar o trecho abaixo:

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js');
    });
  }
*/
