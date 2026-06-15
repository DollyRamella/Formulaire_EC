// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — à modifier avant le déploiement
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Créez un projet sur https://console.firebase.google.com
// 2. Ajoutez une "Web app", copiez le firebaseConfig et collez-le ci-dessous.
// 3. Activez "Realtime Database" dans Firebase Console (mode test pour débuter).
// 4. Déployez sur GitHub Pages (voir README.md).
// ─────────────────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyAxAQD7K_-bLfgnv859UZqC0CROtYJyIFY",
  authDomain: "ateliers-inscriptions.firebaseapp.com",
  databaseURL: "https://ateliers-inscriptions-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ateliers-inscriptions",
  storageBucket: "ateliers-inscriptions.firebasestorage.app",
  messagingSenderId: "308148803648",
  appId: "1:308148803648:web:9955aef6560b8d6da827a5"
};

// ─────────────────────────────────────────────────────────────────────────────
// Ateliers — modifier les noms ou la capacité ici si besoin
// ─────────────────────────────────────────────────────────────────────────────
export const ATELIERS = [
  { key: "culture-gastronomie",      name: "Culture et Gastronomie",         max: 15 },
  { key: "une-langue-a-lautre",      name: "D'une langue à l'autre",         max: 15 },
  { key: "lecture-ecriture",         name: "De la lecture à l'écriture",     max: 15 },
  { key: "expression-vocale",        name: "Expression vocale et corporelle", max: 15 },
  { key: "images-et-paroles",        name: "Images et paroles",              max: 15 },
  { key: "poesie-et-chanson",        name: "Poésie et chanson",              max: 15 },
];
