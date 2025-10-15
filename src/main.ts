/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

// ------------------------------------
//   Initialisation de WorkAdventure
// ------------------------------------
WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);

  // --- Exemple de zone "clock" déjà existante ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = pad(today.getHours()) + ":" + pad(today.getMinutes());
    currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // ------------------------------------
  //  Bouton "Candidater" dans l'action bar
  // ------------------------------------

  // URL de ton image (espace encodé)
  const imagePath = './tilesets/BTN%20Candidater.png';
  const targetUrl = 'https://www.ynov.com/candidater';

  try {
    // Ajout d’un bouton à icône seule dans la barre d’action
    WA.ui.actionBar.addButton({
      id: 'btn-candidater',
      imageSrc: imagePath,             // icône affichée
      toolTip: 'Candidater',           // texte au survol
      clickCallback: () => {           // ou "callback" selon version
        window.open(targetUrl, '_blank');
      }
    });

    console.log('Bouton Candidater ajouté à la barre d’action.');
  } catch (error) {
    console.error('Impossible d’ajouter le bouton Action Bar. Fallback vers le menu.', error);

    // Fallback universel : ajoute une entrée dans le menu
    WA.ui.registerMenuCommand('Candidater', {
      callback: () => {
        window.open(targetUrl, '_blank');
      }
    });
  }

  // ------------------------------------
  //  Initialisation des fonctions extra
  // ------------------------------------
  bootstrapExtra()
    .then(() => {
      console.log('Scripting API Extra ready');
    })
    .catch((e) => console.error(e));

}).catch((e) => console.error(e));

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
