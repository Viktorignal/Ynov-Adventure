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

  // --- Bouton "Candidater" dans l'action bar (icône seule) ---
  const imagePath = './tilesets/BTN%20Candidater.png';   // <-- espace encodé
  const targetUrl = 'https://www.ynov.com/candidater';

  // Version compatible avec tes typings (type 'classic' + callback)
  WA.ui.actionBar.addButton({
    type: 'classic',
    id: 'btn-candidater',
    label: '',                   // vide = icône seule, plus compact
    imageSrc: imagePath,
    toolTip: 'Candidater',
    callback: () => {
      window.open(targetUrl, '_blank');
    }
  });

  // --- Scripting API Extra (facultatif) ---
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
