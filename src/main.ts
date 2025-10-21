/// <reference types="@workadventure/iframe-api-typings" />

// Logs
const log  = (...a: any[]) => console.log("[WA]", ...a);
const err  = (...a: any[]) => console.error("[WA]", ...a);

// Config
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

// État sous-menu TP
let tpOpen = false;
let tpPage = 0;
const PER_PAGE = 3;
let tpButtonIds: string[] = [];

WA.onInit().then(() => {
  log("onInit OK");

  // Candidater — nouvel onglet uniquement
  WA.ui.actionBar.addButton({
    id: "candidater-btn",
    label: "Candidater",
    callback: () => {
      try {
        // @ts-ignore selon version
        if (WA?.nav?.openTab) WA.nav.openTab("https://www.ynov.com/candidature");
        else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      } catch {
        window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      }
    },
  });

  // Téléportation — sous-menu paginé
  WA.ui.actionBar.addButton({
    id: "teleport-btn",
    label: "Téléportation",
    callback: () => toggleTeleportMenu(),
  });

  log("Buttons added");
}).catch((e) => err("onInit error:", e));

// Sous-menu TP
function toggleTeleportMenu() {
  if (tpOpen) { removeTpButtons(); tpOpen = false; return; }
  tpPage = 0; drawTpButtons(); tpOpen = true;
}
function drawTpButtons() {
  removeTpButtons();

  const total = Math.max(1, Math.ceil(zones.length / PER_PAGE));
  tpPage = Math.max(0, Math.min(tpPage, total - 1));
  const start = tpPage * PER_PAGE;
  const slice = zones.slice(start, start + PER_PAGE);

  if (tpPage > 0) addTpButton("tp-prev", "◀", () => { tpPage--; drawTpButtons(); });

  slice.forEach((z, i) => {
    addTpButton(`tp-z-${start + i}`, z.label, () => {
      WA.nav.goToRoom(mapURL + z.id);
      // pour laisser ouvert après TP, commente ces 2 lignes :
      removeTpButtons(); tpOpen = false;
    });
  });

  if (tpPage < total - 1) addTpButton("tp-next", "▶", () => { tpPage++; drawTpButtons(); });
  addTpButton("tp-close", "Fermer", () => { removeTpButtons(); tpOpen = false; });
}
function addTpButton(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  (WA.ui as any).actionBar.addButton({ id, label, callback: cb, clickCallback: cb });
}
function removeTpButtons() {
  const ab: any = WA.ui.actionBar;
  tpButtonIds.forEach((id) => { try { ab.removeButton?.(id); } catch {} });
  tpButtonIds = [];
}

export {};
