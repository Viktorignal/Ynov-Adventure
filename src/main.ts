/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log("Script started successfully");

let currentPopup: any = undefined;

/* === CONFIG TÉLÉPORTATION === */
const mapURL = "/@/ynov-1733302243/ynov_adventure/new-map";
const zones = [
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
/* ============================ */

WA.onInit()
  .then(async () => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    // === Zone "clock" (affiche l’heure) ===
    WA.room.area.onEnter("clock").subscribe(() => {
      const today = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
      currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });
    WA.room.area.onLeave("clock").subscribe(closePopup);

    /* === Bouton CANDIDATER === */
    // Jaune + effet hover
    (WA.ui as any).actionBar.addButton({
      id: "candidater-btn",
      label: "Candidater",
      color: "#f5c400",
      hoverColor: "#ffe066",
      callback: () => {
        try {
          if ((WA as any)?.nav?.openTab)
            (WA as any).nav.openTab("https://www.ynov.com/candidature");
          else
            window.open(
              "https://www.ynov.com/candidature",
              "_blank",
              "noopener,noreferrer"
            );
        } catch {
          window.open(
            "https://www.ynov.com/candidature",
            "_blank",
            "noopener,noreferrer"
          );
        }
      },
    });

    /* === Bouton TÉLÉPORTATION === */
    (WA.ui as any).actionBar.addButton({
      id: "teleport-btn",
      label: "Téléportation",
      color: "#2ea7ff",
      hoverColor: "#79c2ff",
      callback: () => openTeleportationPanel(),
    });

    bootstrapExtra().catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

/* === Téléportation === */
function openTeleportationPanel() {
  const html = `
  <html>
  <body style="
    margin:0;
    padding:12px;
    font-family:sans-serif;
    background:#ffffffee;
    backdrop-filter:blur(6px);
    border-radius:10px;
  ">
    <h4 style="margin:0 0 10px 0;">Choisissez une destination :</h4>
    <div style="display:flex; flex-direction:column; gap:6px;">
      ${zones
        .map(
          (z) => `
          <button
            style="
              padding:8px;
              border-radius:8px;
              border:1px solid #ccc;
              background:#2ea7ff;
              color:white;
              cursor:pointer;
              font-size:14px;
            "
            onmouseover="this.style.background='#79c2ff'"
            onmouseout="this.style.background='#2ea7ff'"
            onclick="parent.postMessage({type:'tp', entry:'${z.id}'}, '*')"
          >
            ${z.label}
          </button>`
        )
        .join("")}
      <button
        style="
          margin-top:8px;
          padding:6px;
          border-radius:8px;
          border:1px solid #ccc;
          background:#ccc;
          cursor:pointer;
        "
        onclick="parent.postMessage({type:'closeTp'}, '*')"
      >
        Fermer
      </button>
    </div>
  </body>
  </html>`.trim();

  const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);

  // Affiche un petit panneau vertical à gauche
  (WA.ui.website as any).open({
    url: dataUrl,
    allowApi: true,
    position: { vertical: "middle", horizontal: "left" },
    size: { width: "18vw", height: "65vh" },
    margin: { left: "1vw" },
    visible: true,
  });
}

// Gestion des actions envoyées depuis le panneau
window.addEventListener("message", (e) => {
  if (e.data?.type === "tp") {
    WA.nav.goToRoom(mapURL + e.data.entry);
    (WA.ui.website as any).close?.();
  } else if (e.data?.type === "closeTp") {
    (WA.ui.website as any).close?.();
  }
});

/* === Utilitaire pour fermer la popup horloge === */
function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
