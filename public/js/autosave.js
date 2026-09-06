// autosave.js – guarda los cambios al ocultar/cerrar la pestaña usando sendBeacon.
// sendBeacon NO bloquea el cierre de la página (a diferencia de await fetch en
// 'beforeunload', que dejaba "Guardando..." colgado y, además, apuntaba a una ruta
// inexistente /autosave -> 404). El payload lo provee la página vía
// window.__autosavePayload(); si no existe, no hace nada.
(function () {
  function flush() {
    try {
      if (typeof window.__autosavePayload !== 'function') return;
      const payload = window.__autosavePayload();
      if (!payload || !payload.url) return;
      // Content-Type application/json para que express.json() lo parsee.
      const blob = new Blob([payload.body || '{}'], { type: 'application/json' });
      navigator.sendBeacon(payload.url, blob);

      // Toast opcional de confirmación (si el elemento existe).
      const toast = document.getElementById('autosaveToast');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
    } catch (err) {
      console.error('Autosave (beacon) falló:', err);
    }
  }

  // 'visibilitychange' (hidden) es más fiable que 'beforeunload', sobre todo en móvil.
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
})();
