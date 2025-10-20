/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);

  // --- Ton code existant : popup heure sur la zone "clock" ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes();
    currentPopup = WA.ui.openPopup('clockPopup', "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // --- Bouton "Candidater" dans l'action bar ---
  (WA.ui as any).actionBar.addButton({
    id: 'candidater-btn',
    label: 'Candidater',
    bgColor: '#edb911',
    isGradient: true,
    // selon version: "callback" OU "clickCallback"
    callback: openCandidatureInNewTab,
    clickCallback: openCandidatureInNewTab,
  });

  bootstrapExtra().catch(e => console.error(e));
}).catch(e => console.error(e));

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
