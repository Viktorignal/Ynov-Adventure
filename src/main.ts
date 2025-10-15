/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

WA.onInit().then(() => {
  // --- TEST VISUEL pour confirmer le chargement du script ---
  const hello = WA.ui.openPopup('hello', '✅ Script chargé !', [{
    label: 'OK',
    callback: () => hello.close()
  }]);
  WA.chat.sendChatMessage('Le script a bien démarré ✅', 'Système');

  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);

  // --- Ta logique existante : popup heure sur la zone "clock" ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = pad(today.getHours()) + ":" + pad(today.getMinutes());
    currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // --- Ajout du bouton "Candidater" ---
  // Image: place ton fichier dans /tilesets/ au même niveau que la map
  // IMPORTANT : l’espace est encodé en %20 dans l’URL
  const imagePath = './tilesets/BTN%20Candidater.png';
  const targetUrl = 'https://www.ynov.com/candidater';

  addCandidaterButton(imagePath, targetUrl);

  // --- Initialisation des features "extra" (facultatif) ---
  bootstrapExtra().then(() => {
    console.log('Scripting API Extra ready');
  }).catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup(){
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

/**
 * Ajoute un bouton "Candidater" dans l'action bar si possible,
 * sinon crée une entrée de menu en fallback.
 * - Compatible avec typings différents (callback / clickCallback)
 * - Compatible si actionBar est absente (versions plus anciennes)
 */
function addCandidaterButton(imageSrc: string, url: string) {
  const openLink = () => { window.open(url, '_blank'); };

  // 1) Tentative : action bar (API récente)
  try {
    if (WA.ui && (WA.ui as any).actionBar && typeof (WA.ui as any).actionBar.addButton === 'function') {
      // Pour être compatible avec diverses versions de typings,
      // on force un cast "any" pour autoriser callback OU clickCallback
      const btnBase = {
        id: 'btn-candidater',
        label: 'Candidater',
        imageSrc: imageSrc,
        toolTip: 'Candidater sur le site',
      };

      // Essai avec "callback"
      (WA.ui as any).actionBar.addButton({
        ...btnBase,
        callback: openLink,
      });

      // Si ta version préfère "clickCallback", décommente ce bloc
      // et commente l’autre — ou laisse tel quel si le premier suffit.
      // (WA.ui as any).actionBar.addButton({
      //   ...btnBase,
      //   clickCallback: openLink,
      // });

      return; // bouton ajouté, on sort
    }
  } catch (e) {
    // on passe au fallback
  }

  // 2) Fallback universel : entrée dans le menu
  try {
    WA.ui.registerMenuCommand('Candidater', {
      callback: openLink
    });
    return;
  } catch (e) {
    // dernier recours : rien
  }

  // 3) (Optionnel) Ultime fallback : petit bouton HTML fixé à l’écran
  // Décommente si tu veux qu’il apparaisse quoi qu’il arrive.
  /*
  const btn = document.createElement('button');
  btn.innerText = 'Candidater';
  btn.style.position = 'fixed';
  btn.style.bottom = '20px';
  btn.style.right = '20px';
  btn.style.zIndex = '9999';
  btn.style.padding = '10px 16px';
  btn.style.border = 'none';
  btn.style.borderRadius = '8px';
  btn.style.background = '#0d6efd';
  btn.style.color = '#fff';
  btn.style.cursor = 'pointer';
  btn.onclick = openLink;
  document.body.appendChild(btn);
  */
}

export {};
