/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: any = undefined;

/* === CONFIG TÉLÉPORTATION === */
const mapURL = "/@/ynov-1733302243/ynov_adventure/new-map";
const zones = [
  { id: "#TPA-IA",     label: "IA" },
  { id: "#TPAINFO",    label: "Informatique" },
  { id: "#TPACYBER",   label: "Cybersécurité" },
  { id: "#TPAARCHI",   label: "Architecture" },
  { id: "#TPABIM",     label: "Bâtiment Numérique" },
  { id: "#TPAAUDIO",   label: "Audiovisuel" },
  { id: "#TPADIGITAL", label: "DIGITAL IA" },
  { id: "#TPA3D",      label: "3D" },
  { id: "#TPAHUB",     label: "Accueil" },
];
// on va créer/retirer dynamiquement ces boutons
let tpButtonsAdded = false;
let tpButtonIds: string[] = [];
/* ============================ */

WA.onInit()
  .then(async () => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    // === Affichage de l'heure sur la zone "clock" (ton code d'origine) ===
    WA.room.area.onEnter("clock").subscribe(() => {
      const today = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
      currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });
    WA.room.area.onLeave("clock").subscribe(closePopup);

    // === Bouton Candidater : uniquement NOUVEL ONGLET (pas d'iframe) ===
    WA.ui.actionBar.addButton({
      id: "candidater-btn",
      label: "Candidater",
      callback: () => {
        // Utilise openTab si dispo (recommandé par WA), sinon fallback navigateur
        try {
          if ((WA as any)?.nav?.openTab) (WA as any).nav.openTab("https://www.ynov.com/candidature");
          else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
        } catch {
          window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
        }
      },
    });

    // === Bouton Téléportation : toggle des sous-boutons dans la barre d'action ===
    WA.ui.actionBar.addButton({
      id: "teleport-toggle",
      label: "Téléportation",
      callback: () => {
        if (tpButtonsAdded) {
          removeTeleportButtons();
        } else {
          addTeleportButtons();
        }
      },
    });

    // petit plus : si tu veux bootstrapExtra, ça ne gêne pas
    bootstrapExtra().catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

/* === Gestion des boutons de téléportation dans la barre d'action === */
function addTeleportButtons() {
  // crée un bouton par zone
  zones.forEach((z, idx) => {
    const id = `tp-${idx}`;
    tpButtonIds.push(id);
    WA.ui.actionBar.addButton({
      id,
      label: z.label,
      callback: () => {
        // téléporte puis retire les boutons pour libérer la barre
        WA.nav.goToRoom(mapURL + z.id);
        // si tu préfères laisser les boutons, commente la ligne suivante :
        removeTeleportButtons();
      },
    });
  });

  // ajoute aussi un bouton "Fermer TP" pour masquer sans téléporter
  const closeId = "tp-close";
  tpButtonIds.push(closeId);
  WA.ui.actionBar.addButton({
    id: closeId,
    label: "Fermer TP",
    callback: () => removeTeleportButtons(),
  });

  tpButtonsAdded = true;
}

function removeTeleportButtons() {
  // removeButton n'est pas toujours typé, on caste en any
  const ab: any = WA.ui.actionBar;
  tpButtonIds.forEach((id) => {
    try { ab.removeButton?.(id); } catch { /* ignore */ }
  });
  tpButtonIds = [];
  tpButtonsAdded = false;
}

/* === utilitaires existants === */
function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
