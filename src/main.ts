/// <reference types="@workadventure/iframe-api-typings" />

// ======== LOG UTILES ========
const log  = (...a: any[]) => console.log("[WA]", ...a);
const warn = (...a: any[]) => console.warn("[WA]", ...a);
const err  = (...a: any[]) => console.error("[WA]", ...a);

log("Script file loaded");

// ======== ETAT POPUPS ========
let tpPopup: any | undefined = undefined;
let clockPopup: any | undefined = undefined;

// ======== CONFIG ========
const mapURL = "/@/ynov-1733302243/ynov_adventure/new-map";
const zones: { id: string; label: string }[] = [
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

// ======== INIT ========
WA.onInit().then(() => {
  log("onInit OK");

  // (Optionnel) petite démo horloge si tu as une zone nommée "clock"
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
    // pas grave si la zone n'existe pas
    warn("clock init warn:", e);
  }

  // Bouton Candidater — ONGLET UNIQUEMENT
  try {
    WA.ui.actionBar.addButton({
      id: "candidater-btn",
      label: "🟡 Candidater",
      callback: () => {
        try {
          // méthode WA si dispo
          // @ts-ignore - selon version
          if (WA?.nav?.openTab) WA.nav.openTab("https://www.ynov.com/candidature");
          else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
        } catch {
          window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
        }
      },
    });
    log("Candidater button added");
  } catch (e) {
    err("add candidater button error:", e);
  }

  // Bouton Téléportation — POPUP VERTICALE
  try {
    WA.ui.actionBar.addButton({
      id: "teleport-btn",
      label: "🧭 Téléportation",
      callback: () => openTeleportPopup(),
    });
    log("Teleportation button added");
  } catch (e) {
    err("add teleport button error:", e);
  }
}).catch((e) => err("onInit error:", e));

// ======== POPUP TÉLÉPORTATION (VERTICALE) ========
function openTeleportPopup(): void {
  try {
    // ferme l’ancienne si elle existe (pour éviter conflits)
    try { tpPopup?.close?.(); } catch {}
    tpPopup = undefined;

    // construit les boutons (un par zone), plus "Fermer"
    const buttons = zones.map((z) => ({
      label: z.label,
      callback: () => {
        log("Teleporting to", mapURL + z.id);
        WA.nav.goToRoom(mapURL + z.id);
        try { tpPopup?.close?.(); } catch {}
        tpPopup = undefined;
      },
    }));

    buttons.push({
      label: "Fermer",
      callback: () => {
        try { tpPopup?.close?.(); } catch {}
        tpPopup = undefined;
      },
    });

    // ouvre la popup (UI native WA = liste VERTICALE)
    tpPopup = WA.ui.openPopup(
      "teleportPopup",
      "Téléportation\n\nChoisissez une destination :",
      buttons
    );
    log("Teleport popup opened");
  } catch (e) {
    err("openTeleportPopup error:", e);

    // Secours de diagnostic : tente une mini-popup de test
    try {
      WA.ui.openPopup("dbgPopup", "Impossible d’ouvrir la popup.\nCliquez OK pour vérifier l’UI.", [
        { label: "OK", callback: () => { try { /* ferme auto */ } catch {} } },
      ]);
    } catch (e2) {
      err("fallback debug popup error:", e2);
    }
  }
}
export {};
