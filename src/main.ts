/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

// ✅ Définition correcte des interfaces

interface CreateUIWebsiteEvent {
    url: string;            // Website URL
    visible?: boolean;      // The website is visible or not
    allowApi?: boolean;     // Allow scripting API on the website
    allowPolicy?: string;   // The list of feature policies allowed
    position: {
        vertical: "top" | "middle" | "bottom";
        horizontal: "left" | "middle" | "right";
    };
    size: {                 // Size on the UI
        height: string;
        width: string;
    };
    margin?: {              // Website margin
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
}

interface UIWebsite {
    readonly id: string;            // Unique ID
    url: string;                    // Website URL
    visible: boolean;               // The website is visible or not
    readonly allowApi: boolean;     // Allow scripting API on the website
    readonly allowPolicy: string;   // The list of feature policies allowed
    position: {
        vertical: string;           // Vertical position (top, middle, bottom)
        horizontal: string;         // Horizontal position (left, middle, right)
    };
    size: {
        height: string;
        width: string;
    };
    margin?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
    };
    close(): Promise<void>;
}
void CreateUIWebsiteEvent;
void UIWebsite;

// ✅ Attente que l’API soit prête
WA.onInit().then(async () => {
    console.log('Scripting API ready');
    console.log('Player tags:', WA.player.tags);

    // ✅ Appel correct à WA.ui.website.open
    const myWebsite = await WA.ui.website.open({
        url: "https://wikipedia.org",
        position: {
            vertical: "middle",
            horizontal: "middle",
        },
        size: {
            height: "50vh",
            width: "50vw",
        },
    });

    myWebsite.position.vertical = "top";

    WA.room.area.onEnter('clock').subscribe(() => {
        const today = new Date();
        const time = today.getHours() + ":" + today.getMinutes();
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });

    WA.room.area.onLeave('clock').subscribe(closePopup);

    // ✅ Initialisation du module extra
    bootstrapExtra()
        .then(() => {
            console.log('Scripting API Extra ready');
        })
        .catch(e => console.error(e));

}).catch(e => console.error(e));

// ✅ Fonction de fermeture popup
function closePopup() {
    if (currentPopup !== undefined) {
        currentPopup.close();
        currentPopup = undefined;
    }
}

export {};
