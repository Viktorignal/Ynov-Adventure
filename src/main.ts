/// <reference types="@workadventure/iframe-api-typings" />

console.log("[WA] Script file loaded");

let clockPopup: any | undefined = undefined;
let tpPopup: any | undefined = undefined;

/* === CONFIG === */
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
/* ============== */

WA.onInit()
  .then(() => {
    console.log("[WA] onInit OK");

    /* === Exemple existant : popup heure sur la zone 'clock' === */
    try {
      WA.room.area.onEnter("clock").subscribe(() => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        clockPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
      });
      WA.room.area.onLeave("clock").subscribe(() => {
        try { clockPopup?.close?.(); } catch {}
        clockPopup = undefined;
      });
    } catch (e) {
      console.warn("[WA] clock init warn:", e);
    }

    /* === Bouton CANDIDATER — onglet uniquement (pas d'iframe) === */
    WA.ui.actionBar.addButton({
      id: "candidater-btn",
      label: "🟡 Candidater",
      callback: () => {
        try {
          if ((WA as any)?.nav?.openTab) {
            (WA as any).nav.openTab("https://www.ynov.com/candidature");
          } else {
            window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
          }
        } catch {
          window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
        }
      },
    });

    /* === Bouton TÉLÉPORTATION — ouvre une liste VERTICALE (popup native) === */
    WA.ui.actionBar.addButton({
      id: "teleport-btn",
      label: "🧭 Téléportation",
      callback: () => openTeleportPopup(),
    });

    console.log("[WA] Buttons added");
  })
  .catch((e) => console.error("[WA] onInit error:", e));

/* === Téléportation: popup verticale native (aucune iframe) === */
function openTeleportPopup() {
  // Si déjà ouverte, on la ferme pour rafraîchir proprement
  try { tpPopup?.close?.(); } catch {}
  tpPopup = undefined;

  const buttons = zones.map((z) => ({
    label: z.label,
    callback: () => {
      WA.nav.goToRoom(mapURL + z.id);
      try { tpPopup?.close?.(); } catch {}
      tpPopup = undefined;
    },
  }));

  // Bouton "Fermer"
  buttons.push({
    label: "Fermer",
    callback: () => {
      try { tpPopup?.close?.(); } catch {}
      tpPopup = undefined;
    },
  });

  // La popup WA empile les boutons verticalement
  tpPopup = WA.ui.openPopup(
    "teleportPopup",
    "Téléportation\n\nChoisissez une destination :",
    buttons
  );
}

export {};
