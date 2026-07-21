// config.js
// ⚠️  Ce fichier contient la clé Firebase de VOTRE NOUVEAU PROJET.
//     Elle est publique par design (cf. règles de sécurité Firebase),
//     mais doit pointer vers un projet Firebase INDÉPENDANT de celui
//     du formulaire A1 d'origine (voir README.md, section "Base Firebase").
//
// TODO : remplacez les valeurs ci-dessous par celles de votre NOUVEAU
// projet Firebase (Console Firebase → Paramètres du projet → Vos applications).
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBYDdEiVNtGYTSlq92Q42i3EnimYyyRBRQ",
  authDomain: "inscriptions-ec.firebaseapp.com",
  databaseURL: "https://inscriptions-ec-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "inscriptions-ec",
  storageBucket: "inscriptions-ec.firebasestorage.app",
  messagingSenderId: "269422912473",
  appId: "1:269422912473:web:1151eb2db464f373656fc8"
};

// ─────────────────────────────────────────────────────────────────────────────
// Niveaux — un bloc par niveau (A1 à C2).
// Chaque niveau a ses propres ateliers (clé, nom, capacité par défaut).
// TODO : remplacez les ateliers d'exemple ci-dessous par les vrais
// intitulés de chaque niveau. La structure (key/name/max) doit rester
// identique pour que le reste du code fonctionne sans modification.
// ─────────────────────────────────────────────────────────────────────────────
export const NIVEAUX = {
  A1: {
    label: "A1",
    ateliers: [
      { key: "culture-gastronomie", name: "Culture et Gastronomie",     max: 15 },
      { key: "lecture-ecriture",    name: "De la lecture à l'écriture", max: 15 },
      { key: "images-et-paroles",   name: "Images et paroles",          max: 15 },
    ]
  },
  A2: {
    label: "A2",
    ateliers: [
      { key: "atelier-1-a2", name: "TODO — Atelier 1 (A2)", max: 15 },
      { key: "atelier-2-a2", name: "TODO — Atelier 2 (A2)", max: 15 },
      { key: "atelier-3-a2", name: "TODO — Atelier 3 (A2)", max: 15 },
    ]
  },
  B1: {
    label: "B1",
    ateliers: [
      { key: "atelier-1-b1", name: "TODO — Atelier 1 (B1)", max: 15 },
      { key: "atelier-2-b1", name: "TODO — Atelier 2 (B1)", max: 15 },
      { key: "atelier-3-b1", name: "TODO — Atelier 3 (B1)", max: 15 },
    ]
  },
  B2: {
    label: "B2",
    ateliers: [
      { key: "atelier-1-b2", name: "TODO — Atelier 1 (B2)", max: 15 },
      { key: "atelier-2-b2", name: "TODO — Atelier 2 (B2)", max: 15 },
      { key: "atelier-3-b2", name: "TODO — Atelier 3 (B2)", max: 15 },
    ]
  },
  C1: {
    label: "C1",
    ateliers: [
      { key: "atelier-1-c1", name: "TODO — Atelier 1 (C1)", max: 15 },
      { key: "atelier-2-c1", name: "TODO — Atelier 2 (C1)", max: 15 },
      { key: "atelier-3-c1", name: "TODO — Atelier 3 (C1)", max: 15 },
    ]
  },
  C2: {
    label: "C2",
    ateliers: [
      { key: "atelier-1-c2", name: "TODO — Atelier 1 (C2)", max: 15 },
      { key: "atelier-2-c2", name: "TODO — Atelier 2 (C2)", max: 15 },
      { key: "atelier-3-c2", name: "TODO — Atelier 3 (C2)", max: 15 },
    ]
  },
};

// Liste des clés de niveaux valides (utilisée pour la validation des URL).
export const NIVEAUX_VALIDES = Object.keys(NIVEAUX);
