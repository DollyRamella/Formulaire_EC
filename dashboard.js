// dashboard.js — tableau de bord unique couvrant tous les niveaux
import { ref, onValue, set }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { NIVEAUX, NIVEAUX_VALIDES } from "./config.js";
import { db, pathCounts, pathCapacities, pathInscriptions } from "./firebase-client.js";
import { requireAuth, logout } from "./auth.js";

await requireAuth();
document.getElementById("btn-logout").addEventListener("click", logout);

// ── State ────────────────────────────────────────────────────────────────
// Données brutes par niveau, tenues à jour en temps réel.
const data = {}; // { [niveau]: { counts, capacities, inscriptions } }
NIVEAUX_VALIDES.forEach(n => { data[n] = { counts: {}, capacities: {}, inscriptions: [] }; });

let niveauActif = null; // null = vue "Tous les niveaux"

// ── Helpers ──────────────────────────────────────────────────────────────
function getMax(niveau, atelier) {
  return data[niveau].capacities[atelier.key] ?? atelier.max;
}

function fmtDate(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function toCSV(rows, headers) {
  const escape = v => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.map(escape).join(";"), ...rows.map(r => r.map(escape).join(";"))].join("\n");
}

function downloadCSV(content, filename) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast-notif show toast-${type}`;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3500);
}

// ── Onglets de niveau ────────────────────────────────────────────────────
function renderTabs() {
  const wrap = document.getElementById("niveau-tabs");
  wrap.innerHTML = "";

  const btnAll = document.createElement("button");
  btnAll.className = "niveau-tab" + (niveauActif === null ? " active" : "");
  btnAll.textContent = "Tous les niveaux";
  btnAll.addEventListener("click", () => { niveauActif = null; renderAll(); });
  wrap.appendChild(btnAll);

  NIVEAUX_VALIDES.forEach(n => {
    const btn = document.createElement("button");
    btn.className = "niveau-tab" + (niveauActif === n ? " active" : "");
    btn.textContent = n;
    btn.addEventListener("click", () => { niveauActif = n; renderAll(); });
    wrap.appendChild(btn);
  });
}

// ── Vue "Tous les niveaux" : résumé global + répartition ────────────────
function renderVueGlobale() {
  document.getElementById("niveaux-summary-section").classList.remove("hidden");
  document.getElementById("section-gauges").classList.add("hidden");
  document.getElementById("section-exports").classList.add("hidden");
  document.getElementById("section-tables").classList.add("hidden");

  let totalInscrits = 0, totalFull = 0, totalPlaces = 0;
  const grid = document.getElementById("niveaux-summary-grid");
  grid.innerHTML = "";

  NIVEAUX_VALIDES.forEach(n => {
    const ateliers = NIVEAUX[n].ateliers;
    const nInscrits = data[n].inscriptions.length;
    const nFull = ateliers.filter(a => (data[n].counts[a.key] || 0) >= getMax(n, a)).length;
    const nPlaces = ateliers.reduce((acc, a) => acc + Math.max(0, getMax(n, a) - (data[n].counts[a.key] || 0)), 0);

    totalInscrits += nInscrits;
    totalFull += nFull;
    totalPlaces += nPlaces;

    const card = document.createElement("div");
    card.className = "niveau-summary-card";
    card.innerHTML = `
      <div class="niveau-summary-code">${n}</div>
      <div class="niveau-summary-line"><strong>${nInscrits}</strong> inscrits</div>
      <div class="niveau-summary-line"><strong>${nFull}</strong> / ${ateliers.length} ateliers complets</div>
      <div class="niveau-summary-line"><strong>${nPlaces}</strong> places restantes</div>
      <button class="btn-export-sm niveau-summary-btn">Voir le détail →</button>`;
    card.querySelector(".niveau-summary-btn").addEventListener("click", () => {
      niveauActif = n; renderAll();
    });
    grid.appendChild(card);
  });

  document.getElementById("total-inscrits").textContent = totalInscrits;
  document.getElementById("total-full").textContent = totalFull;
  document.getElementById("total-places").textContent = totalPlaces;
}

// ── Vue détaillée d'un niveau (jauges, exports, tableaux) ────────────────
function renderVueNiveau(niveau) {
  document.getElementById("niveaux-summary-section").classList.add("hidden");
  document.getElementById("section-gauges").classList.remove("hidden");
  document.getElementById("section-exports").classList.remove("hidden");
  document.getElementById("section-tables").classList.remove("hidden");

  const ateliers = NIVEAUX[niveau].ateliers;
  const { counts, capacities, inscriptions } = data[niveau];

  // Résumé
  document.getElementById("total-inscrits").textContent = inscriptions.length;
  document.getElementById("total-full").textContent = ateliers.filter(a => (counts[a.key] || 0) >= getMax(niveau, a)).length;
  document.getElementById("total-places").textContent = ateliers.reduce((acc, a) => acc + Math.max(0, getMax(niveau, a) - (counts[a.key] || 0)), 0);

  // Jauges
  const grid = document.getElementById("gauge-grid");
  grid.innerHTML = "";
  ateliers.forEach(atelier => {
    const current = counts[atelier.key] || 0;
    const max = getMax(niveau, atelier);
    const rem = max - current;
    const pct = Math.min(100, (current / max) * 100);
    const isFull = rem <= 0;
    const isLow = !isFull && rem <= 3;

    const badgeClass = isFull ? "badge-full" : isLow ? "badge-low" : "badge-ok";
    const badgeText = isFull ? "Complet" : isLow ? `${rem} place${rem > 1 ? "s" : ""}` : "Ouvert";
    const fillClass = isFull ? "fill-full" : isLow ? "fill-low" : "fill-ok";

    const card = document.createElement("div");
    card.className = "gauge-card" + (isFull ? " is-full" : "");
    card.innerHTML = `
      <div class="gauge-card-header">
        <div class="gauge-card-name">${atelier.name}</div>
        <span class="gauge-card-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="gauge-visual">
        <div class="gauge-track">
          <div class="gauge-fill ${fillClass}" style="width:${pct.toFixed(1)}%"></div>
        </div>
        <div class="gauge-legend">
          <span><strong>${current}</strong> inscrits</span>
          <span>max <strong class="gmax">${max}</strong></span>
        </div>
      </div>
      <div class="gauge-controls">
        <label>Capacité :</label>
        <input type="number" class="capacity-input" value="${max}" min="${current}" max="999" step="1" />
        <button class="btn-capacity-save">Enregistrer</button>
        <button class="btn-capacity-reset" title="Remettre à ${atelier.max}">↺</button>
      </div>
      <div class="gauge-save-feedback"></div>`;

    const input = card.querySelector(".capacity-input");
    const fill = card.querySelector(".gauge-fill");
    const gmax = card.querySelector(".gmax");
    input.addEventListener("input", (e) => {
      const newMax = parseInt(e.target.value, 10);
      if (!isNaN(newMax) && newMax >= current) {
        fill.style.width = Math.min(100, (current / newMax) * 100).toFixed(1) + "%";
        gmax.textContent = newMax;
      }
    });

    card.querySelector(".btn-capacity-save").addEventListener("click", async () => {
      const fbEl = card.querySelector(".gauge-save-feedback");
      const saveBtn = card.querySelector(".btn-capacity-save");
      const newMax = parseInt(input.value, 10);

      if (isNaN(newMax) || newMax < 1) {
        fbEl.textContent = "Valeur invalide.";
        fbEl.className = "gauge-save-feedback err";
        return;
      }
      if (newMax < current) {
        fbEl.textContent = `Impossible : ${current} déjà inscrit(s).`;
        fbEl.className = "gauge-save-feedback err";
        input.value = current;
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = "…";
      try {
        await set(ref(db, `${pathCapacities(niveau)}/${atelier.key}`), newMax);
        fbEl.textContent = "✓ Enregistré";
        fbEl.className = "gauge-save-feedback ok";
        showToast(`[${niveau}] Capacité de « ${atelier.name} » mise à jour : ${newMax} places`, "success");
        setTimeout(() => { fbEl.textContent = ""; }, 3000);
      } catch (err) {
        fbEl.textContent = "Erreur — réessayez.";
        fbEl.className = "gauge-save-feedback err";
        showToast("Erreur lors de la sauvegarde.", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Enregistrer";
      }
    });

    card.querySelector(".btn-capacity-reset").addEventListener("click", async () => {
      if (!confirm(`Remettre la capacité de « ${atelier.name} » à ${atelier.max} (valeur par défaut) ?`)) return;
      try {
        await set(ref(db, `${pathCapacities(niveau)}/${atelier.key}`), atelier.max);
        showToast(`[${niveau}] Capacité de « ${atelier.name} » réinitialisée à ${atelier.max}`, "success");
      } catch (err) {
        showToast("Erreur lors de la réinitialisation.", "error");
      }
    });

    grid.appendChild(card);
  });

  // Exports
  const btnWrap = document.getElementById("export-atelier-btns");
  btnWrap.innerHTML = "";
  ateliers.forEach(atelier => {
    const btn = document.createElement("button");
    btn.className = "btn-export-sm";
    btn.textContent = atelier.name;
    btn.addEventListener("click", () => exportAtelier(niveau, atelier));
    btnWrap.appendChild(btn);
  });

  document.getElementById("btn-export-all").onclick = () => {
    const rows = [...inscriptions]
      .sort((a, b) => a.nom.localeCompare(b.nom))
      .map(i => [
        i.nom.toUpperCase(),
        i.prenom,
        i.email,
        (i.ateliers || []).map(k => ateliers.find(a => a.key === k)?.name || k).join(" | "),
        fmtDate(i.timestamp)
      ]);
    const csv = toCSV(rows, ["Nom", "Prénom", "Email", "Ateliers choisis", "Date d'inscription"]);
    downloadCSV(csv, `inscrits-${niveau}-tous-ateliers.csv`);
  };

  // Tableaux
  const tablesWrap = document.getElementById("atelier-tables-wrap");
  tablesWrap.innerHTML = "";
  ateliers.forEach(atelier => {
    const inscrits = inscriptions
      .filter(i => i.ateliers && i.ateliers.includes(atelier.key))
      .sort((a, b) => a.nom.localeCompare(b.nom));
    const c = counts[atelier.key] || 0;
    const max = getMax(niveau, atelier);
    const isFull = c >= max;
    const pct = Math.min(100, (c / max) * 100);

    const section = document.createElement("div");
    section.className = "atelier-table-section";
    section.innerHTML = `
      <div class="atelier-table-header">
        <div>
          <span class="atelier-table-code">${niveau}</span>
          <span class="atelier-table-name">${atelier.name}</span>
          ${isFull ? '<span class="badge-full">Complet</span>' : ""}
        </div>
        <div class="atelier-table-stats">
          <div class="gauge-wrap narrow">
            <div class="gauge-bar" style="width:${pct.toFixed(1)}%"></div>
          </div>
          <span class="atelier-table-count">${c} / ${max}</span>
        </div>
      </div>
      ${inscrits.length === 0
        ? '<p class="empty-table">Aucun inscrit pour le moment.</p>'
        : `<table class="inscrit-table">
            <thead><tr><th>#</th><th>Nom</th><th>Prénom</th><th>Email</th><th>Date d'inscription</th></tr></thead>
            <tbody>${inscrits.map((i, idx) => `
              <tr>
                <td class="cell-num">${idx + 1}</td>
                <td class="cell-nom">${i.nom.toUpperCase()}</td>
                <td>${i.prenom}</td>
                <td class="cell-email">${i.email}</td>
                <td class="cell-date">${fmtDate(i.timestamp)}</td>
              </tr>`).join("")}
            </tbody>
          </table>`}`;
    tablesWrap.appendChild(section);
  });
}

function exportAtelier(niveau, atelier) {
  const inscrits = data[niveau].inscriptions
    .filter(i => i.ateliers && i.ateliers.includes(atelier.key))
    .sort((a, b) => a.nom.localeCompare(b.nom));
  const rows = inscrits.map((i, idx) => [String(idx + 1), i.nom.toUpperCase(), i.prenom, i.email, fmtDate(i.timestamp)]);
  const csv = toCSV(rows, ["#", "Nom", "Prénom", "Email", "Date d'inscription"]);
  downloadCSV(csv, `inscrits-${niveau}-${atelier.key}.csv`);
}

// ── Rendu global ─────────────────────────────────────────────────────────
function renderAll() {
  renderTabs();
  if (niveauActif === null) {
    renderVueGlobale();
  } else {
    renderVueNiveau(niveauActif);
  }
}

// ── Abonnements Firebase temps réel — un par niveau ──────────────────────
NIVEAUX_VALIDES.forEach(niveau => {
  onValue(ref(db, pathInscriptions(niveau)), snap => {
    data[niveau].inscriptions = Object.values(snap.val() || {});
    renderAll();
  });
  onValue(ref(db, pathCounts(niveau)), snap => {
    data[niveau].counts = snap.val() || {};
    renderAll();
  });
  onValue(ref(db, pathCapacities(niveau)), snap => {
    data[niveau].capacities = snap.val() || {};
    renderAll();
  });
});

renderAll();
