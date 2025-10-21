/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("[WA] Script file loaded");

let currentPopup: any = undefined;

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
  .then(async () => {
    console.log("[WA] onInit OK");

    // (Optionnel) ton code horloge
    try {
      WA.room.area.onEnter("clock").subscribe(() => {
        const d = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
        currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
      });
      WA.room.area.onLeave("clock").subscribe(closeClockPopup);
    } catch (e) {
      console.warn("[WA] clock init warn:", e);
    }

    // 1) Bouton Candidater — onglet uniquement (pas d'iframe)
    try {
      WA.ui.actionBar.addButton({
        id: "candidater-btn",
        // Emoji pour un rendu "jaune" visuel (pas de style API dans ta version)
        label: "🟡 Candidater",
        callback: () => {
          try {
            if ((WA as any)?.nav?.openTab) (WA as any).nav.openTab("https://www.ynov.com/candidature");
            else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
          } catch {
            window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
          }
        },
      });
      console.log("[WA] Candidater button added");
    } catch (e) {
      console.error("[WA] add candidater button error:", e);
    }

    // 2) Bouton Téléportation — ouvre une liste VERTICALE (modal si dispo, sinon popup)
    try {
      WA.ui.actionBar.addButton({
        id: "teleport-btn",
        label: "🧭 Téléportation",
        callback: () => openTeleportList(),
      });
      console.log("[WA] Teleportation button added");
    } catch (e) {
      console.error("[WA] add teleport button error:", e);
    }

    try {
      await bootstrapExtra();
    } catch (e) {
      console.warn("[WA] bootstrapExtra warn:", e);
    }
  })
  .catch((e) => console.error("[WA] onInit error:", e));

/* === Téléportation: liste verticale via UI native === */
function openTeleportList() {
  const modalApi = (WA.ui as any)?.modal;

  // 2a) Modal vertical (si disponible sur ta version)
  if (modalApi?.openModal) {
    const buttons = zones.map((z) => ({
      label: z.label,
      callback: () => {
        WA.nav.goToRoom(mapURL + z.id);
        try { modalApi.closeModal?.(); } catch {}
      },
    }));
    buttons.push({ label: "Fermer", callback: () => { try { modalApi.closeModal?.(); } catch {} } });

    modalApi.openModal({
      title: "Téléportation",
      content: "Choisissez une destination :",
      buttons,
    });
    return;
  }

  // 2b) Fallback popup (affichage vertical natif aussi)
  const popupButtons = zones.map((z) => ({
    label: z.label,
    callback: () => {
      WA.nav.goToRoom(mapURL + z.id);
      try { currentPopup?.close?.(); } catch {}
    },
  }));
  popupButtons.push({ label: "Fermer", callback: () => { try { currentPopup?.close?.(); } catch {} } });

  currentPopup = WA.ui.openPopup(
    "tpPopup",
    "Téléportation\n\nChoisissez une destination :",
    popupButtons
  );
}

/* === Utilitaire horloge === */
function closeClockPopup() {
  if (currentPopup !== undefined) {
    try { currentPopup.close(); } catch {}
    currentPopup = undefined;
  }
}

export {};
