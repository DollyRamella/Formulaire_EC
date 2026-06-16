// auth.js — authentification admin (Firebase Auth)
import { initializeApp, getApps, getApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { FIREBASE_CONFIG } from "./config.js";

const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);

/**
 * Protège une page admin : redirige vers login.html
 * si l'utilisateur n'est pas authentifié.
 * Résout avec l'objet user si authentifié.
 */
export function requireAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.replace("login.html");
        return;
      }
      resolve(user);
    });
  });
}

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
  window.location.replace("login.html");
}
