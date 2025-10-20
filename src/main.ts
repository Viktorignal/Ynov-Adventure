/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

declare const WA: any; // tolérant si les typings ne correspondent pas exactement

console.log('[WA] Script file loaded'); // doit apparaître dans la console du navigateur

let currentPopup: any = undefined;

/* =========================
   Téléportation - CONFIG
   ========================= */
const MAP_URL_PATH = '/@/ynov-1733302243/ynov_adventure/new-map'; // <-- chemin relatif (plus robuste que l'URL absolue)
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

WA.onInit().then(async () => {
  console.log('[WA] onInit OK');
  try {
    // Important : initialiser le “extra” tôt (certaines UI en dépendent selon versions)
    await bootstrapExtra();
    console.log('[WA] bootstrapExtra OK');
  } catch (e) {
    console.warn('[WA] bootstrapExtra error (non bloquant):', e);
  }

  // --- Popup heure sur la zone "clock" (code existant) ---
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

  // --- Bouton "Candidater" (robuste : supporte callback OU clickCallback) ---
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
      url: '/teleport.html',  // <-- à la racine de public
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
      // data.entry contient déjà le '#'
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
    WA.nav.openTab?.(url) ?? WA.ui.website.open({ url, position: { vertical: 'middle', horizontal: 'right' }, size: { width: '45vw', height: '90vh' } });
  } catch (_) {
    WA.ui.website.open({ url, position: { vertical: 'middle', horizontal: 'right' }, size: { width: '45vw', height: '90vh' } });
  }
}

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
