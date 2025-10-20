// ===== WorkAdventure plain JS bootstrap (aucun import) =====
(function () {
  const log = (...a) => console.log('[WA]', ...a);
  const warn = (...a) => console.warn('[WA]', ...a);
  const err = (...a) => console.error('[WA]', ...a);

  log('Script file loaded');

  // ---- Config Téléportation ----
  const MAP_URL_PATH = '/@/ynov-1733302243/ynov_adventure/new-map'; // chemin WA vers ta map
  const TP_ENTRIES = [
    { id: '#TPA-IA',     label: 'IA' },
    { id: '#TPAINFO',    label: 'Informatique' },
    { id: '#TPACYBER',   label: 'Cybersécurité' },
    { id: '#TPAARCHI',   label: 'Architecture' },
    { id: '#TPABIM',     label: 'Bâtiment Numérique' },
    { id: '#TPAAUDIO',   label: 'Audiovisuel' },
    { id: '#TPADIGITAL', label: 'DIGITAL IA' },
    { id: '#TPA3D',      label: '3D' },
    { id: '#TPAHUB',     label: 'Accueil' },
  ];
  let tpPanelOpen = false;

  // UI de téléportation embarquée (aucun fichier externe => pas de 404)
  const TELEPORT_HTML = (`
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Téléportation</title>
  <style>
    html,body{margin:0;padding:0;font-family:system-ui, sans-serif}
    .card{background:#ffffffcc; backdrop-filter: blur(6px);
          border:1px solid #ddd; border-radius:12px; padding:12px}
    .title{font-weight:600; font-size:14px; margin-bottom:8px}
    .row{display:flex; gap:8px; align-items:center}
    select,button{font-size:14px; padding:8px 10px; border-radius:10px; border:1px solid #ccc}
    button{cursor:pointer}
    .hint{margin-top:8px; font-size:12px; opacity:.8}
  </style>
</head>
<body>
  <div class="card">
    <div class="title">Choisir une destination</div>
    <div class="row">
      <select id="zone"></select>
      <button id="go">Téléporter</button>
    </div>
    <div class="hint">Clique de nouveau sur le bouton « Téléportation » pour fermer ce menu.</div>
  </div>

  <script>
    const select = document.getElementById('zone');
    const btn = document.getElementById('go');
    let ENTRIES = [];
    let MAP_URL = '';

    window.addEventListener('message', (e) => {
      const data = e.data;
      if (data && data.type === 'tp-init') {
        ENTRIES = Array.isArray(data.entries) ? data.entries : [];
        MAP_URL = data.mapUrl || '';
        select.innerHTML = '';
        ENTRIES.forEach(e => {
          const opt = document.createElement('option');
          opt.value = e.id;
          opt.textContent = e.label || e.id;
          select.appendChild(opt);
        });
      }
    });

    function teleport() {
      const entry = (select.value || '').trim();
      if (!entry) return;
      parent.postMessage({ type: 'tp-go', entry }, '*');
    }
    btn.addEventListener('click', teleport);
    select.addEventListener('keydown', (e) => { if (e.key === 'Enter') teleport(); });
  </script>
</body>
</html>
  `).trim();
  const TELEPORT_DATA_URL = 'data:text/html;charset=utf-8,' + encodeURIComponent(TELEPORT_HTML);

  // Sécurité : si WA n’est pas prêt, on attend
  const waitWA = () => new Promise((resolve) => {
    if (window.WA && WA.onInit) return resolve();
    const i = setInterval(() => {
      if (window.WA && WA.onInit) {
        clearInterval(i);
        resolve();
      }
    }, 50);
  });

  waitWA().then(() => {
    return WA.onInit();
  }).then(() => {
    log('onInit OK');

    // 0) Bouton TEST minimal pour vérifier le chargement
    try {
      const testCb = () => alert('Le script WA est bien chargé ✅');
      (WA.ui && WA.ui.actionBar && WA.ui.actionBar.addButton) && WA.ui.actionBar.addButton({
        id: 'test-btn',
        label: 'Test',
        tooltip: 'Test script',
        callback: testCb,
        clickCallback: testCb,
      });
      log('Test button added');
    } catch (e) {
      err('Failed to add Test button:', e);
    }

    // 1) Bouton CANDIDATER — uniquement nouvel onglet
    try {
      const candidCb = () => {
        const url = 'https://www.ynov.com/candidature';
        try {
          if (WA && WA.nav && typeof WA.nav.openTab === 'function') {
            WA.nav.openTab(url);
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        } catch (_) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      };
      (WA.ui && WA.ui.actionBar && WA.ui.actionBar.addButton) && WA.ui.actionBar.addButton({
        id: 'candidater-btn',
        label: 'Candidater',
        tooltip: 'Ouvrir le formulaire de candidature',
        callback: candidCb,
        clickCallback: candidCb,
      });
      log('Candidater button added');
    } catch (e) {
      err('Failed to add "Candidater" button:', e);
    }

    // 2) Bouton TÉLÉPORTATION — ouvre/ferme un panneau, UI en data URL
    try {
      const tpCb = async () => {
        try {
          if (tpPanelOpen) {
            await WA.ui.website.close('tp-panel');
            tpPanelOpen = false;
            log('Teleport panel closed');
            return;
          }
          await WA.ui.website.open({
            id: 'tp-panel',
            url: TELEPORT_DATA_URL, // pas de 404 possible
            allowApi: true,
            position: { vertical: 'top', horizontal: 'left' },
            size: { width: '28vw', height: '26vh' },
            margin: { top: '1vh', left: '1vw' },
            visible: true,
          });
          window.postMessage({ type: 'tp-init', entries: TP_ENTRIES, mapUrl: MAP_URL_PATH }, '*');
          tpPanelOpen = true;
          log('Teleport panel opened');
        } catch (e) {
          err('toggleTeleportPanel error:', e);
        }
      };

      (WA.ui && WA.ui.actionBar && WA.ui.actionBar.addButton) && WA.ui.actionBar.addButton({
        id: 'tp-menu',
        label: 'Téléportation',
        tooltip: 'Ouvrir/fermer le menu de téléportation',
        callback: tpCb,
        clickCallback: tpCb,
      });
      log('Téléportation button added');
    } catch (e) {
      err('Failed to add "Téléportation" button:', e);
    }

    // 3) Petit exemple existant: popup heure sur zone "clock" (optionnel)
    try {
      let currentPopup;
      WA.room.area.onEnter('clock').subscribe(() => {
        const t = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const time = pad(t.getHours()) + ':' + pad(t.getMinutes());
        currentPopup = WA.ui.openPopup('clockPopup', "It's " + time, []);
      });
      WA.room.area.onLeave('clock').subscribe(() => {
        if (currentPopup) { currentPopup.close(); currentPopup = undefined; }
      });
    } catch (e) {
      warn('clock popup init error:', e);
    }

  }).catch((e) => err('onInit error:', e));

  // Handler messages depuis l’UI de téléportation
  window.addEventListener('message', (e) => {
    const data = e.data;
    try {
      if (data && data.type === 'tp-go' && typeof data.entry === 'string') {
        WA.nav.goToRoom(MAP_URL_PATH + data.entry);
        log('Teleporting to', MAP_URL_PATH + data.entry);
      } else if (data && data.type === 'tp-close') {
        WA.ui.website.close('tp-panel');
        tpPanelOpen = false;
        log('Teleport panel closed by UI');
      }
    } catch (ex) {
      err('message handler error:', ex);
    }
  });
})();
