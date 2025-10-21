/// <reference types="@workadventure/iframe-api-typings" />

// Logs utiles
const log  = (...a: any[]) => console.log("[WA]", ...a);
const err  = (...a: any[]) => console.error("[WA]", ...a);

/* ================== CONFIG ================== */
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
/* ============================================= */

// État du sous-menu de TP
let tpOpen = false;
let tpPage = 0;
const PER_PAGE = 3; // 3 zones par page pour tenir même avec un zoom élevé
let tpButtonIds: string[] = [];

WA.onInit().then(() => {
  log("onInit OK");

  // 🟡 Candidater (onglet uniquement)
  WA.ui.actionBar.addButton({
    id: "candidater-btn",
    label: "🟡 Candidater",
    callback: () => {
      try {
        // @ts-ignore (selon version)
        if (WA?.nav?.openTab) WA.nav.openTab("https://www.ynov.com/candidature");
        else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      } catch {
        window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      }
    },
  });

  // 🧭 Téléportation (toggle le sous-menu)
  WA.ui.actionBar.addButton({
    id: "teleport-btn",
    label: "🧭 Téléportation",
    callback: () => toggleTeleportMenu(),
  });

  log("Buttons added");
}).catch((e) => err("onInit error:", e));

/* =============== Sous-menu Téléportation (action bar, paginé) =============== */
function toggleTeleportMenu() {
  if (tpOpen) {
    removeTpButtons();
    tpOpen = false;
    return;
  }
  tpPage = 0;
  drawTpButtons();
  tpOpen = true;
}

// Construit les boutons pour la page courante
function drawTpButtons() {
  removeTpButtons(); // nettoie avant d'afficher

  const totalPages = Math.max(1, Math.ceil(zones.length / PER_PAGE));
  tpPage = Math.max(0, Math.min(tpPage, totalPages - 1));

  const start = tpPage * PER_PAGE;
  const slice = zones.slice(start, start + PER_PAGE);

  // 1) Bouton "◀" si page > 0
  if (tpPage > 0) {
    addTpButton("tp-prev", "◀", () => {
      tpPage -= 1;
      drawTpButtons();
    });
  }

  // 2) Les zones de la page
  slice.forEach((z, i) => {
    const id = `tp-z-${start + i}`;
    addTpButton(id, z.label, () => {
      WA.nav.goToRoom(mapURL + z.id);
      // après TP, on peut garder le menu ouvert OU non ; ici on le referme
      removeTpButtons();
      tpOpen = false;
    });
  });

  // 3) Bouton "▶" si page < last
  if (tpPage < totalPages - 1) {
    addTpButton("tp-next", "▶", () => {
      tpPage += 1;
      drawTpButtons();
    });
  }

  // 4) Bouton "Fermer"
  addTpButton("tp-close", "Fermer", () => {
    removeTpButtons();
    tpOpen = false;
  });

  log(`TP menu page ${tpPage + 1}/${totalPages}`);
}

// Ajoute un bouton et le mémorise pour suppression ultérieure
function addTpButton(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  WA.ui.actionBar.addButton({
    id,
    label,
    callback: cb,
  });
}

// Supprime tous les boutons du sous-menu
function removeTpButtons() {
  const ab: any = WA.ui.actionBar;
  tpButtonIds.forEach((id) => {
    try { ab.removeButton?.(id); } catch { /* ignore */ }
  });
  tpButtonIds = [];
}

export {};
