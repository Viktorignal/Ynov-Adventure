/// <reference types="@workadventure/iframe-api-typings" />

/* ================== CONFIG ================== */
const MAP_URL = "/@/ynov-1733302243/ynov_adventure/new-map";
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

/* ===== Helpers “compat” ===== */
function addActionButtonCompat(opts: {
  id: string;
  label: string;
  onClick: () => void;
  bgColor?: string;
  isGradient?: boolean;
  hoverColor?: string;
}) {
  const cfg: any = {
    id: opts.id,
    label: opts.label,
    callback: opts.onClick,
    clickCallback: opts.onClick, // selon version
  };
  // Styles (si supportés par l’instance, ils s’appliqueront ; sinon, ignorés)
  if (opts.bgColor) cfg.bgColor = opts.bgColor;
  if (opts.isGradient !== undefined) cfg.isGradient = opts.isGradient;
  if (opts.hoverColor) cfg.hoverColor = opts.hoverColor;

  (WA.ui as any).actionBar.addButton(cfg);
}
function removeActionButton(id: string) {
  const ab: any = WA.ui.actionBar;
  try { ab.removeButton?.(id); } catch {}
}

/* ===== Téléportation : état ===== */
const MAIN_TP_BTN_ID = "teleport-btn";
let tpOpen = false;
let tpPage = 0;
let tpButtonIds: string[] = [];
const IS_MOBILE =
  /Mobi|Android/i.test(navigator.userAgent) ||
  (window.matchMedia && window.matchMedia("(pointer:coarse)").matches) ||
  (typeof window !== "undefined" && window.innerWidth < 768);
// Desktop = 3/page, Mobile = 1/page (si fallback action bar)
const PER_PAGE = IS_MOBILE ? 1 : 3;

WA.onInit().then(() => {
  // 🟡 Candidater — couleur + gradient si supportés (sinon style normal)
  addActionButtonCompat({
    id: "candidater-btn",
    label: "Candidater",
    bgColor: "#edb911",
    isGradient: true,
    onClick: () => {
      try {
        // @ts-ignore (selon version)
        if (WA?.nav?.openTab) WA.nav.openTab("https://www.ynov.com/candidature");
        else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      } catch {
        window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      }
    },
  });

  // 🧭 Téléportation (le bouton disparaît pendant que la liste est ouverte)
  addActionButtonCompat({
    id: MAIN_TP_BTN_ID,
    label: "Téléportation",
    bgColor: "#2ea7ff",
    isGradient: true,
    onClick: () => openTeleportUI(),
  });
}).catch((e) => console.error("[WA] onInit error:", e));

/* === UI Téléportation === */
function openTeleportUI() {
  if (tpOpen) return;
  tpOpen = true;

  // retire le bouton principal pendant l'ouverture de la liste
  removeActionButton(MAIN_TP_BTN_ID);

  // 1) Tenter une POPUP ANCRÉE (si un objet 'tp_anchor' existe dans la map)
  //    -> Meilleur rendu mobile (vertical, natif)
  try {
    openTeleportPopupAnchored("tp_anchor");
    return;
  } catch {
    // 2) Sinon, fallback : sous-menu paginé dans l’action bar
    openTeleportActionBarFallback();
  }
}

function closeTeleportUI() {
  tpOpen = false;
  // nettoie les sous-boutons du fallback si besoin
  removeTpButtons();
  // rétablit le bouton principal
  addActionButtonCompat({
    id: MAIN_TP_BTN_ID,
    label: "Téléportation",
    bgColor: "#2ea7ff",
    isGradient: true,
    onClick: () => openTeleportUI(),
  });
}

/* ---- Variante préférée : POPUP ancrée à un objet de la map ---- */
function openTeleportPopupAnchored(anchorObjectName: string) {
  // On génère les boutons (liste verticale native)
  const buttons = ZONES.map((z) => ({
    label: z.label,
    callback: () => {
      WA.nav.goToRoom(MAP_URL + z.id);
      try { anchoredPopup?.close?.(); } catch {}
      closeTeleportUI();
    },
  }));
  buttons.push({
    label: "Fermer",
    callback: () => {
      try { anchoredPopup?.close?.(); } catch {}
      closeTeleportUI();
    },
  });

  // IMPORTANT : l’id doit exister dans la map (Object Layer → rectangle nommé 'tp_anchor')
  let anchoredPopup: any;
  anchoredPopup = WA.ui.openPopup(
    anchorObjectName,
    "Téléportation\n\nChoisissez une destination :",
    buttons
  );
}

/* ---- Fallback : sous-menu paginé dans l’action bar ---- */
function openTeleportActionBarFallback() {
  tpPage = 0;
  drawTpButtons();
}

function drawTpButtons() {
  removeTpButtons();

  const totalPages = Math.max(1, Math.ceil(ZONES.length / PER_PAGE));
  tpPage = Math.max(0, Math.min(tpPage, totalPages - 1));

  const start = tpPage * PER_PAGE;
  const slice = ZONES.slice(start, start + PER_PAGE);

  // ◀
  if (tpPage > 0) {
    addTpBtn("tp-prev", "◀ Précédent", () => { tpPage -= 1; drawTpButtons(); });
  }

  // zones
  slice.forEach((z, i) => {
    addTpBtn(`tp-z-${start + i}`, z.label, () => {
      WA.nav.goToRoom(MAP_URL + z.id);
      // refermer après TP (si tu veux laisser ouvert, remplace par drawTpButtons();)
      closeTeleportUI();
    });
  });

  // ▶
  if (tpPage < totalPages - 1) {
    addTpBtn("tp-next", "Suivant ▶", () => { tpPage += 1; drawTpButtons(); });
  }

  // ✖
  addTpBtn("tp-close", "✖ Fermer", () => closeTeleportUI());
}

function addTpBtn(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  (WA.ui as any).actionBar.addButton({
    id,
    label,
    callback: cb,
    clickCallback: cb,
  });
}
function removeTpButtons() {
  const ab: any = WA.ui.actionBar;
  tpButtonIds.forEach((id) => { try { ab.removeButton?.(id); } catch {} });
  tpButtonIds = [];
}

export {};
