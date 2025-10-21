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
/* ============================================= */

/* ===== Helpers “compat” pour l’action bar ===== */
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
  // Couleurs si supportées par l’instance (sinon ignorées sans casser)
  if (opts.bgColor) cfg.bgColor = opts.bgColor;
  if (opts.isGradient !== undefined) cfg.isGradient = opts.isGradient;
  if (opts.hoverColor) cfg.hoverColor = opts.hoverColor;
  (WA.ui as any).actionBar.addButton(cfg);
}
function removeActionButton(id: string) {
  const ab: any = WA.ui.actionBar;
  try { ab.removeButton?.(id); } catch {}
}

/* =============== Téléportation (action bar paginée) =============== */
const MAIN_TP_BTN_ID = "teleport-btn";

let tpOpen = false;
let tpPage = 0;
let tpButtonIds: string[] = [];

// Détection mobile : on réduit à 1 zone/page
const IS_MOBILE =
  /Mobi|Android/i.test(navigator.userAgent) ||
  (window.matchMedia && window.matchMedia("(pointer:coarse)").matches) ||
  (typeof window !== "undefined" && window.innerWidth < 768);
const PER_PAGE = IS_MOBILE ? 1 : 3;

WA.onInit().then(() => {
  // 🟡 Candidater — couleur/gradient si supportés (sinon style normal)
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

  // 🧭 Téléportation — bouton principal
  addActionButtonCompat({
    id: MAIN_TP_BTN_ID,
    label: "Téléportation",
    bgColor: "#2ea7ff",
    isGradient: true,
    onClick: () => openTeleportMenu(),
  });
}).catch((e) => console.error("[WA] onInit error:", e));

function openTeleportMenu() {
  if (tpOpen) return;
  tpOpen = true;
  // “soit l’un soit l’autre” : on enlève le bouton principal
  removeActionButton(MAIN_TP_BTN_ID);

  tpPage = 0;
  drawTpButtons();
}

function closeTeleportMenu() {
  removeTpButtons();
  tpOpen = false;

  // On ré-ajoute le bouton principal téléportation
  addActionButtonCompat({
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

  // 1) ◀ Précédent
  if (tpPage > 0) {
    addTpBtn("tp-prev", "◀ Précédent", () => {
      tpPage -= 1;
      drawTpButtons();
    });
  }

  // 2) Zones de la page
  slice.forEach((z, i) => {
    addTpBtn(`tp-z-${start + i}`, z.label, () => {
      WA.nav.goToRoom(MAP_URL + z.id);
      // refermer après TP (si tu veux garder ouvert, remplace par drawTpButtons())
      closeTeleportMenu();
    });
  });

  // 3) Suivant ▶
  if (tpPage < totalPages - 1) {
    addTpBtn("tp-next", "Suivant ▶", () => {
      tpPage += 1;
      drawTpButtons();
    });
  }

  // 4) ✖ Fermer
  addTpBtn("tp-close", "✖ Fermer", () => closeTeleportMenu());
}

function addTpBtn(id: string, label: string, cb: () => void) {
  tpButtonIds.push(id);
  // sous-boutons : pas de style “exotique” pour rester ultra-compatible
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
