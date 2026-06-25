// config.js
// ⚠️  Ce fichier contient votre clé Firebase.
//     Elle est publique par design (cf. règles de sécurité Firebase).
//     Ajoutez ce fichier à .gitignore si vous ne souhaitez pas la committer.

export const FIREBASE_CONFIG = {
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
  { key: "culture-gastronomie",  name: "Culture et Gastronomie",          max: 15 },
  { key: "lecture-ecriture",     name: "De la lecture à l'écriture",      max: 15 },
  { key: "images-et-paroles",    name: "Images et paroles",               max: 15 },
];
