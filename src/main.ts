/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

WA.onInit().then(() => {
  console.log('Scripting API ready');
  WA.chat.sendChatMessage('✅ Script WA initialisé', 'Système');

  // --- Ta logique existante : zone "clock" ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // -------------------------------
  //   Ajout du bouton "Candidater"
  // -------------------------------
  const imagePath = './tilesets/BTN%20Candidater.png';   // <-- espace encodé !
  const targetUrl = 'https://www.ynov.com/candidater';

  addCandidaterButton(imagePath, targetUrl);

  // --- Extra (facultatif) ---
  bootstrapExtra().catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

/**
 * Tente d'ajouter un bouton dans l'action bar.
 * - Si actionBar indisponible -> fallback menu.
 * - Envoie un message dans le chat pour indiquer ce qui a été fait.
 */
function addCandidaterButton(imageSrc: string, url: string) {
  const openLink = () => window.open(url, '_blank');

  // Attendre un court instant que l'UI soit bien prête sur certaines versions
  setTimeout(() => {
    try {
      const uiAny = WA.ui as any;
      const actionBar = uiAny?.actionBar;
      if (actionBar && typeof actionBar.addButton === 'function') {
        // VERSION LARGE : label + icône (pour être sûr de le voir même si l'icône ne charge pas)
        // Sur les versions où le nom de prop diffère, on passe callback ET clickCallback (l'une sera ignorée).
        actionBar.addButton({
          id: 'btn-candidater',
          label: 'Candidater',       // laisse le label pour vérifier la présence
          imageSrc: imageSrc,        // tu pourras retirer le label ensuite pour une icône seule
          toolTip: 'Candidater',
          callback: openLink,
          clickCallback: openLink,
        });

        WA.chat.sendChatMessage('🟦 Bouton Candidater ajouté à la barre d’action. Si tu ne le vois pas, élargis la fenêtre (layout responsive).', 'Système');

        // (Option) une fois vérifié, tu pourras relancer en enlevant le label pour n’afficher que l’icône :
        // actionBar.removeButton('btn-candidater');
        // actionBar.addButton({ id:'btn-candidater', imageSrc, toolTip:'Candidater', callback: openLink, clickCallback: openLink });

        return;
      }
    } catch (_) {
      // on tombera dans le fallback
    }

    // Fallback : entrée de menu
    try {
      WA.ui.registerMenuCommand('Candidater', { callback: openLink });
      WA.chat.sendChatMessage('ℹ️ Action bar indisponible sur cette version. Ajouté dans le menu.', 'Système');
      return;
    } catch (_) {
      // rien
    }

     --- Dernier recours : bouton HTML fixé (décommente pour l’activer) ---
    *
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
    WA.chat.sendChatMessage('🟩 Bouton HTML fixé ajouté (fallback).', 'Système');
    */
  }, 200);
}

export {};
