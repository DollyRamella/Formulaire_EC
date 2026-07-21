// firebase-client.js — initialisation Firebase unique + chemins scopés par niveau
import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { FIREBASE_CONFIG } from "./config.js";

const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);

// Toutes les données dynamiques vivent sous /levels/{niveau}/...
// Ce namespace isole totalement ce projet de tout autre système
// qui utiliserait la même base Firebase (voir README.md).
export const pathCounts       = (niveau) => `levels/${niveau}/counts`;
export const pathCapacities   = (niveau) => `levels/${niveau}/capacities`;
export const pathEmails       = (niveau) => `levels/${niveau}/emailsInscrits`;
export const pathInscriptions = (niveau) => `levels/${niveau}/inscriptions`;
