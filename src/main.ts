/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

/* =========================
   Téléportation - CONFIG
   ========================= */
const MAP_URL = 'https://play.workadventu.re/@/ynov-1733302243/ynov_adventure/new-map';
// Les IDs contiennent déjà le '#'
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
/* ========================= */

WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);

  // --- Ton code existant : popup heure sur la zone "clock" ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    currentPopup = WA.ui.openPopup('clockPopup', "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // --- Bouton "Candidater" dans l'action bar (existant) ---
  (WA.ui as any).actionBar.addButton({
    id: 'candidater-btn',
    label: 'Candidater',
    bgColor: '#edb911',
    isGradient: true,
    // selon version: "callback" OU "clickCallback"
    callback: openCandidatureInNewTab,
    clickCallback: openCandidatureInNewTab,
  });

  // --- Bouton "Téléportation" (ouvre/ferme le menu déroulant) ---
  (WA.ui as any).actionBar.addButton({
    id: 'tp-menu',
    label: 'Téléportation',
    tooltip: 'Ouvrir/fermer le menu de téléportation',
    bgColor: '#0ea5e9',
    isGradient: true,
    callback: toggleTeleportPanel,
    clickCallback: toggleTeleportPanel,
  });

  bootstrapExtra().catch(e => console.error(e));
}).catch(e => console.error(e));

/* =========================
   Téléportation - logique
   ========================= */
async function toggleTeleportPanel() {
  if (tpPanelOpen) {
    await (WA.ui as any).website.close('tp-panel');
    tpPanelOpen = false;
    return;
  }
  await (WA.ui as any).website.open({
    id: 'tp-panel',
    url: '/teleport.html',   // <-- FICHIER À LA RACINE DE "public"
    allowApi: true,
    position: { vertical: 'top', horizontal: 'left' },
    size: { width: '28vw', height: '26vh' },
    margin: { top: '1vh', left: '1vw' },
    visible: true,
  });
  // Envoie la config à l'iframe dès l'ouverture
  window.postMessage({ type: 'tp-init', entries: TP_ENTRIES, mapUrl: MAP_URL }, '*');
  tpPanelOpen = true;
}

// Réception depuis l'UI : demande de téléportation / fermeture
window.addEventListener('message', (e) => {
  const data = (e as MessageEvent).data;
  if (data?.type === 'tp-go' && typeof data.entry === 'string') {
    // data.entry inclut déjà le '#'
    (WA.nav as any).goToRoom(`${MAP_URL}${data.entry}`);
  } else if (data?.type === 'tp-close') {
    (WA.ui as any).website.close('tp-panel');
    tpPanelOpen = false;
  }
});
/* ========================= */

function openCandidatureInNewTab() {
  const url = 'https://www.ynov.com/candidature';

  // Méthode officielle : nouvel onglet
  try {
    (WA.nav as any).openTab(url); // WA.nav.openTab(url)
    return;
  } catch (_) {
    // Fallback sûr : panneau intégré si openTab indisponible
    (WA.ui as any).website.open({
      url,
      position: { vertical: 'middle', horizontal: 'right' },
      size: { width: '45vw', height: '90vh' }
    });
  }
}

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
