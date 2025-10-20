/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

declare const WA: any;

console.log('[WA] Script file loaded');

let currentPopup: any = undefined;

/* =========================
   Téléportation - CONFIG
   ========================= */
const MAP_URL_PATH = '/@/ynov-1733302243/ynov_adventure/new-map'; // chemin relatif vers ta map
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

/* UI embarquée en data URL (pas de fichier externe, pas de 404) */
const TELEPORT_HTML = `
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

  <script type="module">
    const select = document.getElementById('zone');
    const btn = document.getElementById('go');

    let ENTRIES = [];
    let MAP_URL = '';

    window.addEventListener('message', (e) => {
      const data = e.data;
      if (data?.type === 'tp-init') {
        ENTRIES = Array.isArray(data.entries) ? data.entries : [];
        MAP_URL = data.mapUrl || '';
        fillOptions();
      }
    });

    function fillOptions() {
      select.innerHTML = '';
      ENTRIES.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = e.label || e.id;
        select.appendChild(opt);
      });
    }

    function teleport() {
      const entry = select.value?.trim();
      if (!entry) return;
      parent.postMessage({ type: 'tp-go', entry }, '*');
    }

    btn.addEventListener('click', teleport);
    select.addEventListener('keydown', (e) => { if (e.key === 'Enter') teleport(); });
  </script>
</body>
</html>
`.trim();

const TELEPORT_DATA_URL = 'data:text/html;charset=utf-8,' + encodeURIComponent(TELEPORT_HTML);
/* ========================= */

WA.onInit().then(async () => {
  console.log('[WA] onInit OK');
  try {
    await bootstrapExtra();
    console.log('[WA] bootstrapExtra OK');
  } catch (e) {
    console.warn('[WA] bootstrapExtra error (non bloquant):', e);
  }

  // --- Popup heure sur la zone "clock" (existant) ---
  try {
    WA.room.area.onEnter('clock').subscribe(() => {
      const today = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
      currentPopup = WA.ui.openPopup('clockPopup', "It's " + time, []);
    });
    WA.room.area.onLeave('clock').subscribe(closePopup);
  } catch (e) {
    console.warn('[WA] clock popup init error:', e);
  }

  // --- Bouton "Candidater" — uniquement nouvel onglet (pas d'iframe) ---
  try {
    const candidCb = () => openCandidatureInNewTab();
    WA.ui.actionBar.addButton?.({
      id: 'candidater-btn',
      label: 'Candidater',
      bgColor: '#edb911',
      isGradient: true,
      callback: candidCb,
      clickCallback: candidCb,
    }) || WA.ui.actionBar.addButton({
      id: 'candidater-btn',
      label: 'Candidater',
      callback: candidCb
    });
    console.log('[WA] Candidater button added');
  } catch (e) {
    console.error('[WA] Failed to add "Candidater" button:', e);
  }

  // --- Bouton "Téléportation" (ouvre/ferme le menu) ---
  try {
    const tpCb = () => toggleTeleportPanel();
    WA.ui.actionBar.addButton?.({
      id: 'tp-menu',
      label: 'Téléportation',
      tooltip: 'Ouvrir/fermer le menu de téléportation',
      bgColor: '#0ea5e9',
      isGradient: true,
      callback: tpCb,
      clickCallback: tpCb,
    }) || WA.ui.actionBar.addButton({
      id: 'tp-menu',
      label: 'Téléportation',
      callback: tpCb
    });
    console.log('[WA] Téléportation button added');
  } catch (e) {
    console.error('[WA] Failed to add "Téléportation" button:', e);
  }
}).catch((e: any) => console.error('[WA] onInit error:', e));

/* =========================
   Téléportation - logique
   ========================= */
async function toggleTeleportPanel() {
  try {
    if (tpPanelOpen) {
      await WA.ui.website.close('tp-panel');
      tpPanelOpen = false;
      console.log('[WA] Teleport panel closed');
      return;
    }
    await WA.ui.website.open({
      id: 'tp-panel',
      url: TELEPORT_DATA_URL,   // plus de 404 : HTML embarqué
      allowApi: true,
      position: { vertical: 'top', horizontal: 'left' },
      size: { width: '28vw', height: '26vh' },
      margin: { top: '1vh', left: '1vw' },
      visible: true,
    });
    window.postMessage({ type: 'tp-init', entries: TP_ENTRIES, mapUrl: MAP_URL_PATH }, '*');
    tpPanelOpen = true;
    console.log('[WA] Teleport panel opened');
  } catch (e) {
    console.error('[WA] toggleTeleportPanel error:', e);
  }
}

// Réception depuis l'UI : demande de téléportation / fermeture
window.addEventListener('message', (e: MessageEvent) => {
  const data = e.data;
  try {
    if (data?.type === 'tp-go' && typeof data.entry === 'string') {
      WA.nav.goToRoom(`${MAP_URL_PATH}${data.entry}`);
      console.log('[WA] Teleporting to', `${MAP_URL_PATH}${data.entry}`);
    } else if (data?.type === 'tp-close') {
      WA.ui.website.close('tp-panel');
      tpPanelOpen = false;
      console.log('[WA] Teleport panel closed by UI');
    }
  } catch (err) {
    console.error('[WA] message handler error:', err);
  }
});
/* ========================= */

function openCandidatureInNewTab() {
  const url = 'https://www.ynov.com/candidature';
  try {
    // Méthode WA si dispo
    if (WA?.nav?.openTab) {
      WA.nav.openTab(url);
      return;
    }
  } catch (_) { /* ignore */ }
  // Fallback sans iframe : ouverture navigateur
  window.open(url, '_blank', 'noopener,noreferrer');
}

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
