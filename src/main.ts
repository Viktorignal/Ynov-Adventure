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

/* ======= RÉGLAGES MENU PAGINÉ ======= */
// Taille fixe et robuste (évite les heuristiques mobile/UA)
const PER_PAGE = 3;

/* ============ HELPERS ============ */
// Attend que l'action bar soit dispo (si WA n'a pas fini d'init l'UI)
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
  id: string; label: string; onClick: () => void; bgColor?: string; isGradient?: boolean;
}) {
  const ab: any = (WA.ui as any)?.actionBar;
  if (!ab?.addButton) { L.err("actionBar.addButton introuvable"); return; }

  // Évite les doublons si rechargé
  try { ab.removeButton?.(opts.id); } catch {}

  const base: any = { id: opts.id, label: opts.label, callback: opts.onClick, clickCallback: opts.onClick };
  try {
    if (opts.bgColor !== undefined) base.bgColor = opts.bgColor;
    if (opts.isGradient !== undefined) base.isGradient = opts.isGradient;
    ab.addButton(base);
  } catch {
    try { ab.addButton({ id: opts.id, label: opts.label, callback: opts.onClick, clickCallback: opts.onClick }); } catch {}
  }
}
function removeButtonSafe(id: string) {
  const ab: any = (WA.ui as any)?.actionBar;
  try { ab?.removeButton?.(id); } catch {}
}

/* ======= ÉTAT TÉLÉPORTATION ======= */
const MAIN_TP_BTN_ID = "teleport-btn";
let tpOpen = false;
let tpPage = 0;
let tpButtonIds: string[] = [];
let unregisterMenu: Array<() => void> = [];

/* ============ INIT ============ */
WA.onInit()
  .then(() => {
    // Entrées PERMANENTES dans les paramètres (utile mobile)
    registerMenuCommands();
    return waitForActionBar();
  })
  .then(() => {
    // Bouton principal en haut
    addButtonSafe({
      id: MAIN_TP_BTN_ID,
      label: "Téléportation",
      bgColor: "#2ea7ff",
      isGradient: true,
      onClick: () => openTeleportMenu(),
    });
  })
  .catch((e) => L.err("Init error:", e));

/* ============ MENU PARAMÈTRES (toujours visibles) ============ */
function registerMenuCommands() {
  // Nettoyage si déjà enregistré
  if (unregisterMenu.length) {
    unregisterMenu.forEach((u) => { try { u(); } catch {} });
    unregisterMenu = [];
  }

  // “Téléportation” (ouvre le menu paginé en haut)
  try {
    const unregTp = WA.ui.registerMenuCommand("Téléportation", () => openTeleportMenu());
    if (typeof unregTp === "function") unregisterMenu.push(unregTp);
  } catch (e) { L.err("registerMenuCommand Téléportation error:", e); }

  // Une entrée par zone (accès direct depuis paramètres)
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

/* ============ TÉLÉPORTATION (action bar paginée) ============ */
function openTeleportMenu() {
  if (tpOpen) return;
  tpOpen = true;

  // Retire le bouton principal pour libérer de la place
  removeButtonSafe(MAIN_TP_BTN_ID);

  tpPage = 0;
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

  const totalPages = Math.max(1, Math.ceil(ZONES.length / PER_PAGE));
  tpPage = Math.max(0, Math.min(tpPage, totalPages - 1));

  const start = tpPage * PER_PAGE;
  const slice = ZONES.slice(start, start + PER_PAGE);

  // ◀ Précédent
  if (tpPage > 0) addTpBtn("tp-prev", "◀", () => { tpPage -= 1; drawTpButtons(); });

  // Boutons de zones de la page
  slice.forEach((z, i) => {
    addTpBtn(`tp-z-${start + i}`, z.label, () => {
      try { WA.nav.goToRoom(MAP_URL + z.id); } catch (e) { L.err("goToRoom error:", e); }
      closeTeleportMenu();
    });
  });

  // ▶ Suivant
  if (tpPage < totalPages - 1) addTpBtn("tp-next", "▶", () => { tpPage += 1; drawTpButtons(); });

  // ✖ Fermer
  addTpBtn("tp-close", "✖", () => closeTeleportMenu());

  L.log(`TP menu page ${tpPage + 1}/${totalPages}`);
}

function addTpBtn(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  const ab: any = (WA.ui as any)?.actionBar;
  try { ab.addButton({ id, label, callback: cb, clickCallback: cb }); } catch (e) {
    L.err(`Ajout bouton ${id} impossible:`, e);
  }
}
function removeTpButtons() {
  const ab: any = (WA.ui as any)?.actionBar;
  tpButtonIds.forEach((id) => { try { ab.removeButton?.(id); } catch {} });
  tpButtonIds = [];
}

export {};
