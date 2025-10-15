/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

WA.onInit().then(() => {
  console.log('Scripting API ready');
  WA.chat.sendChatMessage('✅ Script chargé avec succès', 'Système');

  // --- Test visuel (confirmation de chargement) ---
  const hello = WA.ui.openPopup('hello', '✅ Script chargé !', [{
    label: 'OK',
    callback: () => hello.close()
  }]);

  // --- Zone "clock" (ton code existant) ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // ------------------------------------------
  // BOUTON FIXE "Candidater" (toujours visible)
  // ------------------------------------------
  const imagePath = './tilesets/BTN%20Candidater.png'; // attention à l’espace encodé
  const targetUrl = 'https://www.ynov.com/candidater';

  // Crée le bouton
  const btn = document.createElement('button');
  btn.title = 'Candidater';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '9999';
  btn.style.width = '64px';
  btn.style.height = '64px';
  btn.style.border = 'none';
  btn.style.borderRadius = '50%';
  btn.style.cursor = 'pointer';
  btn.style.background = `url("${imagePath}") center/contain no-repeat`;
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  btn.onclick = () => window.open(targetUrl, '_blank');

  document.body.appendChild(btn);

  // --- Initialisation des fonctions extra ---
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
