/// <reference types="@workadventure/iframe-api-typings" />

// Logs utiles
const log  = (...a: any[]) => console.log("[WA]", ...a);
const warn = (...a: any[]) => console.warn("[WA]", ...a);
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

let tempTpButtonIds: string[] = []; // pour le fallback action bar

WA.onInit().then(() => {
  log("onInit OK");

  // 🟡 Candidater (onglet uniquement, jamais d'iframe)
  WA.ui.actionBar.addButton({
    id: "candidater-btn",
    label: "🟡 Candidater",
    callback: () => {
      try {
        // @ts-ignore selon la version
        if (WA?.nav?.openTab) WA.nav.openTab("https://www.ynov.com/candidature");
        else window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      } catch {
        window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      }
    },
  });

  // 🧭 Téléportation
  WA.ui.actionBar.addButton({
    id: "teleport-btn",
    label: "🧭 Téléportation",
    callback: () => openTeleportUI(),
  });

  log("Buttons added");
}).catch((e) => err("onInit error:", e));

/* =============== Téléportation UI =============== */
function openTeleportUI() {
  // 1) Essayer le MODAL natif (ne nécessite aucun objet de map)
  const modalApi: any = (WA.ui as any)?.modal;
  if (modalApi?.openModal) {
    const buttons = zones.map((z) => ({
      label: z.label,
      callback: () => {
        WA.nav.goToRoom(mapURL + z.id);
        try { modalApi.closeModal?.(); } catch {}
      },
    }));
    buttons.push({ label: "Fermer", callback: () => { try { modalApi.closeModal?.(); } catch {} } });

    modalApi.openModal({
      title: "Téléportation",
      content: "Choisissez une destination :",
      buttons,
    });
    log("Teleport modal opened");
    return;
  }

  // 2) Fallback : sous-menu temporaire dans la barre d’action
  openTeleportActionBarFallback();
}

/* -------- Fallback : sous-menu action bar -------- */
function openTeleportActionBarFallback() {
  // Nettoyer d’éventuels anciens boutons
  removeTeleportActionBarButtons();

  // Créer un bouton par zone (oui, ils s’alignent horizontalement, mais c’est un secours)
  zones.forEach((z, idx) => {
    const id = `tp-${idx}`;
    tempTpButtonIds.push(id);
    WA.ui.actionBar.addButton({
      id,
      label: z.label,
      callback: () => {
        WA.nav.goToRoom(mapURL + z.id);
        // Retire les boutons après TP (tu peux commenter si tu veux les garder)
        removeTeleportActionBarButtons();
      },
    });
  });

  // bouton Fermer
  const closeId = "tp-close";
  tempTpButtonIds.push(closeId);
  WA.ui.actionBar.addButton({
    id: closeId,
    label: "Fermer TP",
    callback: () => removeTeleportActionBarButtons(),
  });

  log("Teleport action-bar fallback opened");
}

function removeTeleportActionBarButtons() {
  const ab: any = WA.ui.actionBar;
  tempTpButtonIds.forEach((id) => {
    try { ab.removeButton?.(id); } catch {}
  });
  tempTpButtonIds = [];
}
/* ================================================= */

export {};
