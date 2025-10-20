/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ', WA.player.tags);

    // --------- Ton code existant : popup horloge ----------
    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });

    WA.room.area.onLeave('clock').subscribe(closePopup);
    // ------------------------------------------------------

    // --------- Bouton Action Bar : Candidater ----------
    (WA.ui as any).actionBar.addButton({
        id: 'candidater-btn',
        label: 'Candidater',
        bgColor: '#edb911',       // couleur dorée
        isGradient: true,         // effet dégradé
        callback: () => {
            console.log('Bouton Candidater cliqué');
            window.open('https://www.ynov.com/candidature', '_blank');
        },
        clickCallback: () => {
            console.log('Bouton Candidater cliqué');
            window.open('https://www.ynov.com/candidature', '_blank');
        }
    });
    // ------------------------------------------------------

    // Initialisation des fonctionnalités "extra"
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
