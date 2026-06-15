// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION — à modifier avant le déploiement
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Créez un projet sur https://console.firebase.google.com
// 2. Ajoutez une "Web app", copiez le firebaseConfig et collez-le ci-dessous.
// 3. Activez "Realtime Database" dans Firebase Console (mode test pour débuter).
// 4. Déployez sur GitHub Pages (voir README.md).
// ─────────────────────────────────────────────────────────────────────────────

export const FIREBASE_CONFIG = {
  apiKey:            "VOTRE_API_KEY",
  authDomain:        "VOTRE_PROJECT.firebaseapp.com",
  databaseURL:       "https://VOTRE_PROJECT-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "VOTRE_PROJECT",
  storageBucket:     "VOTRE_PROJECT.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId:             "VOTRE_APP_ID"
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
