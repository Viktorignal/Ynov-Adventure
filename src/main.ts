/// <reference types="@workadventure/iframe-api-typings" />

import { bootstrapExtra } from "@workadventure/scripting-api-extra";

console.log('Script started successfully');

let currentPopup: any = undefined;

/* =========================
   Téléportation - CONFIG
   ========================= */
const MAP_URL = 'https://play.workadventu.re/@/ynov-1733302243/ynov_adventure/new-map';
// Les IDs contiennent déjà le '#'
const TP_ENTRIES = [
  { id: '#TPA-IA',     label: 'IA' },
  { id: '#TPAINFO',    label: 'Informatique' },
  { id: '#TPACYBER',   label: 'Cybersécurité' },
  { id: '#TPAARCHI',   label: 'Architecture' },
  { id: '#TPABIM',     label: 'Bâtiment Numérique' },
  { id: '#TPAAUDIO',   label: 'Audiovisuel' },
  { id: '#TPADIGITAL', label: 'DIGITAL IA' },
  { id: '#TPA3D',      label: '3D' },
  { id: '#TPAHUB',     label: 'Accueil' },
];
let tpPanelOpen = false;
/* ========================= */

WA.onInit().then(() => {
  console.log('Scripting API ready');
  console.log('Player tags: ', WA.player.tags);

  // --- Ton code existant : popup heure sur la zone "clock" ---
  WA.room.area.onEnter('clock').subscribe(() => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
    currentPopup = WA.ui.openPopup('clockPopup', "It's " + time, []);
  });
  WA.room.area.onLeave('clock').subscribe(closePopup);

  // --- Bouton "Candidater" dans l'action bar (existant) ---
  (WA.ui as any).actionBar.addButton({
    id: 'candidater-btn',
    label: 'Candidater',
