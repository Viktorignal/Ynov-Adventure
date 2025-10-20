/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ', WA.player.tags);

    // --- Exemple existant : zone "clock" ---
    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });
    WA.room.area.onLeave('clock').subscribe(closePopup);

    // ------------------------------------------
    // BOUTON FIXE EN HAUT DE L'ÉCRAN
    // ------------------------------------------
    const bouton = document.createElement('button');
    bouton.innerText = 'Mon bouton';
    bouton.style.position = 'fixed';
    bouton.style.top = '20px';        // <-- position verticale
    bouton.style.right = '20px';      // <-- position horizontale
    bouton.style.zIndex = '9999';     // <-- au-dessus de tout
    bouton.style.padding = '10px 20px';
    bouton.style.fontSize = '16px';
    bouton.style.border = 'none';
    bouton.style.borderRadius = '6px';
    bouton.style.background = '#edb911';
    bouton.style.color = '#000';
    bouton.style.cursor = 'pointer';
    bouton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

    bouton.onclick = () => {
        window.open('https://www.ynov.com', '_blank');
    };

    document.body.appendChild(bouton);

    // ------------------------------------------
    // Initialisation de la librairie extra
    // ------------------------------------------
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
