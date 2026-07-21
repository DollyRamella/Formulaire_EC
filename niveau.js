// niveau.js — sélection et validation du niveau courant à partir de l'URL
import { NIVEAUX_VALIDES } from "./config.js";

const NIVEAU_PAR_DEFAUT = "A1";

/**
 * Lit le paramètre ?niveau= dans l'URL et le valide contre la liste
 * des niveaux connus (config.js). Retombe sur NIVEAU_PAR_DEFAUT si absent
 * ou invalide — évite d'écrire dans un chemin Firebase arbitraire.
 */
export function getNiveauCourant() {
  const params = new URLSearchParams(window.location.search);
  const brut = (params.get("niveau") || "").toUpperCase().trim();
  return NIVEAUX_VALIDES.includes(brut) ? brut : NIVEAU_PAR_DEFAUT;
}

/** Construit l'URL vers une page donnée pour un niveau donné. */
export function urlPourNiveau(niveau, page = "index.html") {
  return `${page}?niveau=${encodeURIComponent(niveau)}`;
}
