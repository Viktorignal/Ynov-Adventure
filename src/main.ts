/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);

  // --- Zone "clock" (ton code existant) ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // --- Bouton "Candidater" dans la barre d'action (icône seule) ---
  const imagePath = './tilesets/BTN%20Candidater.png'; // espace encodé !
  const targetUrl = 'https://www.ynov.com/candidater';

  // On contourne les variations de typings avec un cast "any"
  try {
    (WA.ui as any).actionBar.addButton({
      id: 'btn-candidater',
      // pas de label -> icône seule (plus compact, reste visible hors burger)
      imageSrc: imagePath,
      toolTip: 'Candidater',
      // selon ta version, c'est "callback" OU "clickCallback".
      // On fournit les deux, l'API ignorera la propriété inconnue.
      callback: () => window.open(targetUrl, '_blank'),
      clickCallback: () => window.open(targetUrl, '_blank'),
    });
    console.log('Action bar button added.');
  } catch (e) {
    console.error('Action bar API not available, falling back to menu.', e);
    // Fallback menu si vraiment nécessaire
    WA.ui.registerMenuCommand('Candidater', {
      callback: () => window.open(targetUrl, '_blank'),
    });
  }

  // --- Extensions optionnelles ---
  bootstrapExtra()
    .then(() => console.log('Scripting API Extra ready'))
    .catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
