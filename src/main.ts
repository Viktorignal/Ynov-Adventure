/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

//code pour ui button
WA.ui.website.open(website: CreateUIWebsiteEvent): Promise<UIWebsite>

interface CreateUIWebsiteEvent {
    url: string,            // Website URL
    visible?: boolean,      // The website is visible or not
    allowApi?: boolean,     // Allow scripting API on the website
    allowPolicy?: string,   // The list of feature policies allowed
    position: {
        vertical: "top"|"middle"|"bottom",,
        horizontal: "left","middle","right",
    },
    size: {                 // Size on the UI (available units: px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem and others values auto|inherit)
        height: string,
        width: string,
    },
    margin?: {              // Website margin (available units: px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem and others values auto|inherit)
        top?: string,
        bottom?: string,
        left?: string,
        right?: string,
    },
}

interface UIWebsite {
    readonly id: string,            // Unique ID
    url: string,                    // Website URL
    visible: boolean,               // The website is visible or not
    readonly allowApi: boolean,     // Allow scripting API on the website
    readonly allowPolicy: string,   // The list of feature policies allowed
    position: {
        vertical: string,           // Vertical position (top, middle, bottom)
        horizontal: string,         // Horizontal position (left, middle, right)
    },
    size: {                         // Size on the UI (available units: px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem and others values auto|inherit)
        height: string,
        width: string,
    },
    margin?: {                      // Website margin (available units: px|em|%|cm|in|pc|pt|mm|ex|vw|vh|rem and others values auto|inherit)
        top?: string,
        bottom?: string,
        left?: string,
        right?: string,
    },
    close(): Promise<void>,         // Close the current website instance
}


// Waiting for the API to be ready
WA.onInit().then(() => {
    console.log('Scripting API ready');
    console.log('Player tags: ',WA.player.tags)

// call code
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
    })

    WA.room.area.onLeave('clock').subscribe(closePopup)

    // The line below bootstraps the Scripting API Extra library that adds a number of advanced properties/features to WorkAdventure
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

export {};
