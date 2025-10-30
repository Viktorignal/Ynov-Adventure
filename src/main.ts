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
  } catch {
    try { ab.addButton({ id: opts.id, label: opts.label, callback: opts.onClick, clickCallback: opts.onClick }); } catch {}
  }
}

/* ======= ÉTAT TÉLÉPORTATION ======= */
const MAIN_TP_BTN_ID = "teleport-btn";
let tpOpen = false;
let tpButtonIds: string[] = [];

/* ============ INIT ============ */
WA.onInit().then(() => {
  addButtonSafe({
    id: MAIN_TP_BTN_ID,
    label: "Téléportation",
    bgColor: "#2ea7ff",
    isGradient: true,
    onClick: () => toggleTeleportMenu(),
  });
}).catch((e) => L.err("onInit error:", e));

/* ============ TÉLÉPORTATION (sans pagination, WA gère l’affichage) ============ */
function toggleTeleportMenu() {
  if (tpOpen) closeTeleportMenu();
  else openTeleportMenu();
}

function openTeleportMenu() {
  if (tpOpen) return;
