/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: any = undefined;
// On garde une référence sur la co-website ouverte pour pouvoir la fermer
let candidSite: any | null = null;

WA.onInit().then(() => {
  console.log("Scripting API ready");
  console.log("Player tags: ", WA.player.tags);

  // --- Ton code existant : zone "clock" ---
  WA.room.area.onEnter("clock").subscribe(() => {
    const today = new Date();
    const time = today.getHours() + ":" + today.getMinutes();
    currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
  });
  WA.room.area.onLeave("clock").subscribe(closePopup);

  // --- Bouton Action Bar : ouvre/ferme le panneau candidature ---
  (WA.ui as any).actionBar.addButton({
    id: "candidater-btn",
    label: "Candidater",
    bgColor: "#edb911",
    isGradient: true,
    // selon la version : "callback" OU "clickCallback"
    callback: toggleCandidaturePanel,
    clickCallback: toggleCandidaturePanel,
  });

  // (facultatif) init extra
  bootstrapExtra().catch((e) => console.error(e));
}).catch((e) => console.error(e));

async function toggleCandidaturePanel() {
  try {
    // Si déjà ouverte -> on ferme
    if (candidSite) {
      await candidSite.close(); // UIWebsite.close()
      candidSite = null;
      return;
    }

    // Sinon -> on ouvre et on mémorise la référence
    candidSite = await (WA.ui as any).website.open({
      url: "https://www.ynov.com/candidature",
      position: { vertical: "middle", horizontal: "right" },
      size: { width: "45vw", height: "90vh" },
      margin: { right: "2vw" },
      allowApi: false,
    });
  } catch (e) {
    console.error("Erreur ouverture/fermeture candidature", e);
  }
}

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
