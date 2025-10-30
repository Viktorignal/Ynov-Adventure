/// <reference types="@workadventure/iframe-api-typings" />

/* ============ LOGS ============ */
const L = {
  log: (...a: any[]) => console.log("[WA]", ...a),
  err: (...a: any[]) => console.error("[WA]", ...a),
};

/* ============ CONFIG ============ */
const MAP_URL = "/@/ynov-1733302243/ynov_adventure/new-map";
const ZONES: { id: string; label: string }[] = [
  { id: "#TPA-IA", label: "IA" },
  { id: "#TPAINFO", label: "Informatique" },
  { id: "#TPACYBER", label: "Cybersécurité" },
  { id: "#TPAARCHI", label: "Architecture" },
  { id: "#TPABIM", label: "Bâtiment Numérique" },
  { id: "#TPAAUDIO", label: "Audiovisuel" },
  { id: "#TPADIGITAL", label: "DIGITAL IA" },
  { id: "#TPA3D", label: "3D" },
  { id: "#TPAHUB", label: "Accueil" },
];

/* ============ HELPERS ============ */
// Attend l'action bar si nécessaire
function waitForActionBar(maxTries = 25, delayMs = 200): Promise<void> {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const tick = () => {
      const ab: any = (WA.ui as any)?.actionBar;
      if (ab?.addButton) return resolve();
      tries++;
      if (tries >= maxTries) return reject(new Error("actionBar indisponible"));
      setTimeout(tick, delayMs);
    };
    tick();
  });
}

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
  try { ab.removeButton?.(opts.id); } catch {}

  const base: any = {
    id: opts.id,
    label: opts.label,
    callback: opts.onClick,
    clickCallback: opts.onClick,
  };

  try {
    if (opts.bgColor !== undefined) base.bgColor = opts.bgColor;
    if (opts.isGradient !== undefined) base.isGradient = opts.isGradient;
    ab.addButton(base);
  } catch {
    try {
      ab.addButton({
        id: opts.id,
        label: opts.label,
        callback: opts.onClick,
        clickCallback: opts.onClick,
      });
    } catch (e2) {
      L.err(`Échec ajout bouton ${opts.id}:`, e2);
    }
  }
}

/* ======= ÉTAT TÉLÉPORTATION ======= */
const MAIN_TP_BTN_ID = "teleport-btn";
let tpOpen = false;
let tpButtonIds: string[] = [];
let unregisterMenu: Array<() => void> = [];

/* ============ INIT ============ */
WA.onInit()
  .then(() => {
    // 1) Enregistre les entrées PERMANENTES dans le menu des paramètres
    registerMenuCommands();

    // 2) Assure l’action bar et ajoute le bouton “Téléportation”
    return waitForActionBar();
  })
  .then(() => {
    addButtonSafe({
      id: MAIN_TP_BTN_ID,
      label: "Téléportation",
      bgColor: "#2ea7ff",
      isGradient: true,
      onClick: () => toggleTeleportMenu(),
    });
  })
  .catch((e) => L.err("Init error:", e));

/* ============ MENU PARAMÈTRES ============ */
function registerMenuCommands() {
  // Nettoie si ré-enregistré
  if (unregisterMenu.length) {
    unregisterMenu.forEach((u) => { try { u(); } catch {} });
    unregisterMenu = [];
  }

  // Entrée “Téléportation” (ouvre/ferme le menu d’actions)
  try {
    const unregTp = WA.ui.registerMenuCommand("Téléportation", () => toggleTeleportMenu());
    if (typeof unregTp === "function") unregisterMenu.push(unregTp);
  } catch (e) {
    L.err("registerMenuCommand Teleportation error:", e);
  }

  // Une entrée par zone — toujours présentes dans les paramètres
  ZONES.forEach((z) => {
    try {
      const unreg = WA.ui.registerMenuCommand(z.label, () => {
        try { WA.nav.goToRoom(MAP_URL + z.id); } catch (e2) { L.err("goToRoom error:", e2); }
      });
      if (typeof unreg === "function") unregisterMenu.push(unreg);
    } catch (e) {
      L.err(`registerMenuCommand ${z.label} error:`, e);
    }
  });
}

/* ============ TÉLÉPORTATION (Action Bar) ============ */
function toggleTeleportMenu() {
  if (tpOpen) closeTeleportMenu();
  else openTeleportMenu();
}

function openTeleportMenu() {
  if (tpOpen) return;
  tpOpen = true;
  drawTpButtons();
}

function closeTeleportMenu() {
  removeTpButtons();
  tpOpen = false;
}

function drawTpButtons() {
  removeTpButtons();

  // Crée un bouton pour chaque zone (en haut, dans l’action bar)
  ZONES.forEach((z, idx) => {
    addTpBtn(`tp-z-${idx}`, z.label, () => {
      try { WA.nav.goToRoom(MAP_URL + z.id); } catch (e) { L.err("goToRoom error:", e); }
      closeTeleportMenu();
    });
  });

  // Bouton de fermeture
  addTpBtn("tp-close", "✖", () => closeTeleportMenu());
}

function addTpBtn(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  const ab: any = (WA.ui as any)?.actionBar;
  try {
    ab.addButton({ id, label, callback: cb, clickCallback: cb });
  } catch (e) {
    L.err(`Erreur lors de l'ajout du bouton ${id}:`, e);
  }
}

function removeTpButtons() {
  const ab: any = (WA.ui as any)?.actionBar;
  tpButtonIds.forEach((id) => { try { ab.removeButton?.(id); } catch {} });
  tpButtonIds = [];
}

export {};
