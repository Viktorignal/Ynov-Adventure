/// <reference types="@workadventure/iframe-api-typings" />

/* ============ LOGS ============ */
const L = {
  log: (...a: any[]) => console.log("[WA]", ...a),
  err: (...a: any[]) => console.error("[WA]", ...a),
};

/* ============ CONFIG ============ */
const MAP_URL = "/@/ynov-1733302243/ynov_adventure/e-jpo";
const ZONES: { id: string; label: string }[] = [
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

/* ============ HELPERS ============ */
/** Ajoute un bouton. Si l’instance refuse la couleur/gradient, on retente sans style. */
function addButtonSafe(opts: {
  id: string;
  label: string;
  onClick: () => void;
  bgColor?: string;
  isGradient?: boolean;
}) {
  const ab: any = (WA.ui as any)?.actionBar;
  if (!ab?.addButton) {
    L.err("actionBar.addButton introuvable");
    return;
  }
  const base: any = { id: opts.id, label: opts.label, callback: opts.onClick, clickCallback: opts.onClick };
  try {
    if (opts.bgColor !== undefined) base.bgColor = opts.bgColor;
    if (opts.isGradient !== undefined) base.isGradient = opts.isGradient;
    ab.addButton(base);
    L.log(`Button added: ${opts.id} (with style if supported)`);
  } catch (e) {
    try {
      ab.addButton({ id: opts.id, label: opts.label, callback: opts.onClick, clickCallback: opts.onClick });
      L.log(`Button added: ${opts.id} (fallback no-style)`);
    } catch (e2) {
      L.err(`Failed to add button ${opts.id}:`, e2);
    }
  }
}
function removeButtonSafe(id: string) {
  const ab: any = (WA.ui as any)?.actionBar;
  try { ab?.removeButton?.(id); } catch {}
}

/* ======= ÉTAT TÉLÉPORTATION ======= */
const MAIN_TP_BTN_ID = "teleport-btn";
let tpOpen = false;
let tpButtonIds: string[] = [];

/* ============ INIT ============ */
WA.onInit().then(() => {
  L.log("onInit OK");

  // Bouton TÉLÉPORTATION (disparaît quand le menu est ouvert)
  addButtonSafe({
    id: MAIN_TP_BTN_ID,
    label: "Téléportation",
    bgColor: "#2ea7ff",
    isGradient: true,
    onClick: () => openTeleportMenu(),
  });

  L.log("Buttons added");
}).catch((e) => L.err("onInit error:", e));

/* ============ TÉLÉPORTATION (liste simple, sans pagination) ============ */
function openTeleportMenu() {
  if (tpOpen) return;
  tpOpen = true;

  // On enlève le bouton principal pendant l’ouverture du menu
  removeButtonSafe(MAIN_TP_BTN_ID);

  drawTpButtons();
}

function closeTeleportMenu() {
  removeTpButtons();
  tpOpen = false;

  // Ré-ajoute le bouton principal
  addButtonSafe({
    id: MAIN_TP_BTN_ID,
    label: "Téléportation",
    bgColor: "#2ea7ff",
    isGradient: true,
    onClick: () => openTeleportMenu(),
  });
}

function drawTpButtons() {
  removeTpButtons();

  // Ajoute tous les boutons de zones (sans pagination/adaptation)
  ZONES.forEach((z, idx) => {
    addTpBtn(`tp-z-${idx}`, z.label, () => {
      try { WA.nav.goToRoom(MAP_URL + z.id); } catch (e) { L.err("goToRoom error:", e); }
      // Referme le menu après TP
      closeTeleportMenu();
    });
  });

  // ✖ Fermer
  addTpBtn("tp-close", "✖", () => closeTeleportMenu());

  L.log(`TP menu ouvert avec ${ZONES.length} zones (+ fermer).`);
}

function addTpBtn(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  const ab: any = (WA.ui as any)?.actionBar;
  try {
    ab.addButton({ id, label, callback: cb, clickCallback: cb });
  } catch (e) {
    L.err(`Failed to add TP sub-button ${id}:`, e);
  }
}
function removeTpButtons() {
  const ab: any = (WA.ui as any)?.actionBar;
  tpButtonIds.forEach((id) => { try { ab.removeButton?.(id); } catch {} });
  tpButtonIds = [];
}

export {};
