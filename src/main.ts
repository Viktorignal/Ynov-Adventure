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
// nombre d’options par page dans la popup
const PAGE_SIZE = 4;
/* ============== */

WA.onInit()
  .then(() => {
    console.log("[WA] onInit OK");

    // (Facultatif) Popup heure sur la zone 'clock'
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

    // Bouton CANDIDATER — onglet uniquement
    WA.ui.actionBar.addButton({
      id: "candidater-btn",
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

    // Bouton TÉLÉPORTATION — popup verticale paginée
    WA.ui.actionBar.addButton({
      id: "teleport-btn",
      label: "🧭 Téléportation",
      callback: () => openTeleportPopup(0),
    });

    console.log("[WA] Buttons added");
  })
  .catch((e) => console.error("[WA] onInit error:", e));

/* === Téléportation: popup verticale native + pagination === */
function openTeleportPopup(pageIndex: number) {
  // sécurité : bornes
  const totalPages = Math.ceil(zones.length / PAGE_SIZE);
  const page = Math.max(0, Math.min(pageIndex, Math.max(0, totalPages - 1)));

  // ferme l’ancienne popup si ouverte
  try { tpPopup?.close?.(); } catch {}
  tpPopup = undefined;

  // slice des options pour la page courante
  const start = page * PAGE_SIZE;
  const items = zones.slice(start, start + PAGE_SIZE);

  // boutons “destination”
  const buttons = items.map((z) => ({
    label: z.label,
    callback: () => {
      WA.nav.goToRoom(mapURL + z.id);
      try { tpPopup?.close?.(); } catch {}
      tpPopup = undefined;
    },
  }));

  // zone de navigation (précédent/suivant) si plusieurs pages
  const nav: { label: string; callback: () => void }[] = [];
  if (page > 0) {
    nav.push({
      label: "◀ Précédent",
      callback: () => openTeleportPopup(page - 1),
    });
  }
  if (page < totalPages - 1) {
    nav.push({
      label: "Suivant ▶",
      callback: () => openTeleportPopup(page + 1),
    });
  }

  // bouton Fermer
  const closeBtn = {
    label: "Fermer",
    callback: () => {
      try { tpPopup?.close?.(); } catch {}
      tpPopup = undefined;
    },
  };

  // assemble : d’abord les options, puis nav, puis Fermer
  const popupButtons = [...buttons, ...nav, closeBtn];

  // corps de la popup
  const header = totalPages > 1
    ? `Téléportation (page ${page + 1}/${totalPages})`
    : "Téléportation";
  const body = `${header}\n\nChoisissez une destination :`;

  // affiche la popup (verticale nativement)
  tpPopup = WA.ui.openPopup("teleportPopup", body, popupButtons);
}

/* === utilitaire horloge === */
function closeClockPopup() {
  if (clockPopup !== undefined) {
    try { clockPopup.close(); } catch {}
    clockPopup = undefined;
  }
}

export {};
