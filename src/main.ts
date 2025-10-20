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

    // --------- EXEMPLE WorkAdventure : bouton Action Bar ----------
    // Add action bar button 'Register'.
    // (Cast en any pour neutraliser les différences de typings entre versions)
    (WA.ui as any).actionBar.addButton({
        id: 'gradient-btn',
        label: 'Register',
        bgColor: '#edb911',
        isGradient: true,
        // selon la version, la prop peut s'appeler "callback" OU "clickCallback" :
        callback: (event: any) => {
            console.log('Button clicked', event);
            (WA.ui as any).actionBar.removeButton('gradient-btn');
        },
        clickCallback: (event: any) => {
            console.log('Button clicked', event);
            (WA.ui as any).actionBar.removeButton('gradient-btn');
        }
    });
    // --------------------------------------------------------------

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
    bootstrapExtra()
        .then(() => {
            console.log('Scripting API Extra ready');
        })
        .catch(e => console.error(e));

}).catch(e => console.error(e));

function closePopup() {
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

export {};
