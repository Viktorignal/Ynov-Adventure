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
let panelOuvert = false;
/* ============================ */

WA.onInit()
  .then(() => {
    console.log("Scripting API ready");
    console.log("Player tags: ", WA.player.tags);

    // === Affichage de l'heure sur la zone "clock" ===
    WA.room.area.onEnter("clock").subscribe(() => {
      const today = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
      currentPopup = WA.ui.openPopup("clockPopup", "It's " + time, []);
    });
    WA.room.area.onLeave("clock").subscribe(closePopup);

    // === Bouton Candidater (ouvre un nouvel onglet, pas d'iframe) ===
    WA.ui.actionBar.addButton({
      id: "candidater-btn",
      label: "Candidater",
      callback: () => {
        window.open("https://www.ynov.com/candidature", "_blank", "noopener,noreferrer");
      },
    });

    // === Bouton Téléportation ===
    WA.ui.actionBar.addButton({
      id: "teleport-btn",
      label: "Téléportation",
      callback: async () => {
        if (panelOuvert) {
          // ta version n'accepte pas d'argument ici
          await WA.ui.website.close();
          panelOuvert = false;
          return;
        }

        // Petit menu déroulant créé à la volée (data URL, aucun fichier externe)
        const html = `
        <html>
          <body style="margin:0;font-family:sans-serif;background:#fff8;border-radius:10px;padding:10px">
            <h4 style="margin:0 0 8px 0">Choisir une destination</h4>
            <select id="zone" style="font-size:14px;padding:5px;border-radius:6px">
              ${zones.map(z => `<option value="${z.id}">${z.label}</option>`).join("")}
            </select>
            <button id="go" style="margin-left:8px;padding:5px 10px;border-radius:6px">Téléporter</button>
            <script>
              const sel = document.getElementById('zone');
              const btn = document.getElementById('go');
              btn.onclick = () => {
                const val = sel.value;
                parent.postMessage({ type: 'tp', entry: val }, '*');
              };
            </script>
          </body>
        </html>`.trim();

        const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);

        await WA.ui.website.open({
          url: dataUrl,
          allowApi: true,
          position: { vertical: "top", horizontal: "left" },
          size: { width: "26vw", height: "20vh" },
          margin: { top: "1vh", left: "1vw" },
          visible: true,
        });
        panelOuvert = true;
      },
    });

    // === Gestion des messages de téléportation ===
    window.addEventListener("message", (e) => {
      if (e.data?.type === "tp") {
        WA.nav.goToRoom(mapURL + e.data.entry);
      }
    });

    bootstrapExtra().catch((e) => console.error(e));
  })
  .catch((e) => console.error(e));

function closePopup() {
  if (currentPopup !== undefined) {
    currentPopup.close();
    currentPopup = undefined;
  }
}

export {};
