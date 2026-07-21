// app.js — logique du formulaire d'inscription, paramétrée par niveau
import { ref, onValue, push, runTransaction, set, remove }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { NIVEAUX } from "./config.js";
import { getNiveauCourant } from "./niveau.js";
import { db, pathCounts, pathCapacities, pathEmails, pathInscriptions } from "./firebase-client.js";

// ── Niveau courant (lu depuis ?niveau= dans l'URL) ─────────────────────────
const NIVEAU = getNiveauCourant();
const ATELIERS = NIVEAUX[NIVEAU].ateliers;

document.getElementById("niveau-titre").textContent = NIVEAU;
document.getElementById("page-title").textContent = `Inscription ${NIVEAU} — Enseignements Complémentaires`;

// ── State ──────────────────────────────────────────────────────────────
let selected = new Set();
let counts = {};
let capacities = {};

function effectiveMax(atelier) {
  return capacities[atelier.key] ?? atelier.max;
}

function emailToKey(email) {
  return email.trim().toLowerCase().replace(/[.#$\[\]]/g, "_");
}

// ── Render cards ───────────────────────────────────────────────────────
const grid = document.getElementById("ateliers-grid");

function renderCards() {
  grid.innerHTML = "";
  ATELIERS.forEach(atelier => {
    const count = counts[atelier.key] || 0;
    const max = effectiveMax(atelier);
    const remaining = max - count;
    const isFull = remaining <= 0;
    const isSelected = selected.has(atelier.key);
    const pct = Math.min(100, (count / max) * 100);

    const card = document.createElement("label");
    card.className = "atelier-card" +
      (isFull ? " full" : "") +
      (isSelected ? " selected" : "");
    card.setAttribute("for", "cb-" + atelier.key);
    card.innerHTML = `
      <input type="checkbox" id="cb-${atelier.key}" value="${atelier.key}"
        ${isSelected ? "checked" : ""}
        ${(isFull && !isSelected) ? "disabled" : ""}
        class="atelier-cb" />
      <div class="card-inner">
        <div class="card-code">${NIVEAU}</div>
        <div class="card-name">${atelier.name}</div>
        <div class="card-footer">
          <div class="gauge-wrap">
            <div class="gauge-bar" style="width:${pct}%"></div>
          </div>
          <div class="card-places ${isFull ? "full-label" : remaining <= 3 ? "low" : ""}">
            ${isFull
              ? "Complet"
              : remaining + " place" + (remaining > 1 ? "s" : "") +
                " restante" + (remaining > 1 ? "s" : "")}
          </div>
        </div>
      </div>`;
    card.querySelector(".atelier-cb").addEventListener("change", handleCheck);
    grid.appendChild(card);
  });
}

function handleCheck(e) {
  const key = e.target.value;
  if (e.target.checked) {
    if (selected.size >= 2) {
      e.target.checked = false;
      document.getElementById("error-max").classList.remove("hidden");
      setTimeout(() => document.getElementById("error-max").classList.add("hidden"), 4000);
      return;
    }
    selected.add(key);
  } else {
    selected.delete(key);
    document.getElementById("error-max").classList.add("hidden");
  }
  updateCounter();
  renderCards();
  validateForm();
}

function updateCounter() {
  const n = selected.size;
  document.getElementById("counter-num").textContent = n;
  document.getElementById("selection-counter").className =
    "selection-counter" + (n === 2 ? " complete" : n === 1 ? " partial" : "");
}

// ── Validation ─────────────────────────────────────────────────────────
function validateForm() {
  const prenom = document.getElementById("input-prenom").value.trim();
  const nom = document.getElementById("input-nom").value.trim();
  const email = document.getElementById("input-email").value.trim();

  for (const key of [...selected]) {
    const atelier = ATELIERS.find(a => a.key === key);
    const max = effectiveMax(atelier);
    if ((counts[key] || 0) >= max) {
      selected.delete(key);
    }
  }

  const ok = prenom && nom && email && selected.size === 2;
  document.getElementById("btn-submit").disabled = !ok;
}

["input-prenom", "input-nom", "input-email"].forEach(id =>
  document.getElementById(id).addEventListener("input", validateForm)
);

// ── Submit ─────────────────────────────────────────────────────────────
document.getElementById("btn-submit").addEventListener("click", async () => {
  const prenom = document.getElementById("input-prenom").value.trim();
  const nom = document.getElementById("input-nom").value.trim();
  const email = document.getElementById("input-email").value.trim();
  const choix = [...selected];
  const btn = document.getElementById("btn-submit");
  btn.disabled = true;
  btn.textContent = "Inscription en cours…";
  const emailKey = emailToKey(email);

  try {
    // Réservation de l'email — empêche les doublons pour ce niveau.
    try {
      await set(ref(db, `${pathEmails(NIVEAU)}/${emailKey}`), {
        email,
        timestamp: Date.now()
      });
    } catch (emailErr) {
      alert("Cette adresse e-mail est déjà inscrite pour ce niveau. Chaque étudiant ne peut s'inscrire qu'une seule fois par niveau.");
      btn.disabled = false;
      btn.textContent = "Confirmer mon inscription";
      return;
    }

    for (const key of choix) {
      const atelier = ATELIERS.find(a => a.key === key);
      const maxNow = effectiveMax(atelier);
      let over = false;
      await runTransaction(ref(db, `${pathCounts(NIVEAU)}/${key}`), current => {
        const c = current || 0;
        if (c >= maxNow) { over = true; return undefined; }
        return c + 1;
      });
      if (over) {
        await remove(ref(db, `${pathEmails(NIVEAU)}/${emailKey}`));
        alert(`L'atelier "${atelier.name}" est complet. Veuillez en choisir un autre.`);
        btn.disabled = false;
        btn.textContent = "Confirmer mon inscription";
        return;
      }
    }

    await push(ref(db, pathInscriptions(NIVEAU)), {
      prenom, nom, email,
      ateliers: choix,
      timestamp: Date.now()
    });

    document.getElementById("confirm-name").textContent =
      `${prenom} ${nom.toUpperCase()} (${email})`;
    const ul = document.getElementById("confirm-ateliers");
    ul.innerHTML = choix.map(k => {
      const a = ATELIERS.find(x => x.key === k);
      return `<li>${a.name}</li>`;
    }).join("");
    document.getElementById("confirmation-overlay").classList.remove("hidden");

  } catch (err) {
    try { await remove(ref(db, `${pathEmails(NIVEAU)}/${emailKey}`)); } catch (_) {}
    alert("Erreur lors de l'inscription. Veuillez réessayer.");
    console.error(err);
    btn.disabled = false;
    btn.textContent = "Confirmer mon inscription";
  }
});

document.getElementById("btn-new-inscription").addEventListener("click", () => {
  selected.clear();
  document.getElementById("input-prenom").value = "";
  document.getElementById("input-nom").value = "";
  document.getElementById("input-email").value = "";
  document.getElementById("confirmation-overlay").classList.add("hidden");
  document.getElementById("btn-submit").textContent = "Confirmer mon inscription";
  updateCounter();
  renderCards();
  validateForm();
});

// ── Abonnements Firebase temps réel (scopés au niveau courant) ─────────
onValue(ref(db, pathCounts(NIVEAU)), snapshot => {
  counts = snapshot.val() || {};
  for (const key of [...selected]) {
    const atelier = ATELIERS.find(a => a.key === key);
    if ((counts[key] || 0) >= effectiveMax(atelier)) {
      selected.delete(key);
    }
  }
  updateCounter();
  renderCards();
  validateForm();
});

onValue(ref(db, pathCapacities(NIVEAU)), snapshot => {
  capacities = snapshot.val() || {};
  for (const key of [...selected]) {
    const atelier = ATELIERS.find(a => a.key === key);
    if ((counts[key] || 0) >= effectiveMax(atelier)) {
      selected.delete(key);
    }
  }
  updateCounter();
  renderCards();
  validateForm();
});

renderCards();
updateCounter();
