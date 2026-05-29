// =============================================
// URL DE BASE DE L'API
// =============================================
const API = "http://localhost:3000/api/clients";

// =============================================
// MÉTRIQUES — met à jour les cartes de résumé
// =============================================
async function atualizarMetricas(dados) {
  // total général — toujours depuis la base complète
  const todos = await fetch(API).then(r => r.json());
  document.getElementById("m-total").textContent  = todos.length;
  document.getElementById("m-filter").textContent = dados.length;

  // compte les SMS et mails envoyés dans la base complète
  const sms  = todos.filter(c => c.type_envoi === "SMS"  && c.statut === "Envoyé").length;
  const mail = todos.filter(c => c.type_envoi === "Mail" && c.statut === "Envoyé").length;
  document.getElementById("m-sms").textContent  = sms;
  document.getElementById("m-mail").textContent = mail;
}

// =============================================
// BADGE — retourne la classe CSS selon le type d'envoi
// =============================================
function badgeTipo(tipo) {
  const classes = {
    SMS:      "badge badge-sms",
    Mail:     "badge badge-mail",
    Courrier: "badge badge-courrier",
  };
  return classes[tipo] || "badge";
}

// =============================================
// BADGE — retourne la classe CSS selon le statut
// =============================================
function badgeStatut(statut) {
  const classes = {
    "Envoyé":     "badge badge-envoye",
    "En attente": "badge badge-attente",
    "Erreur":     "badge badge-erreur",
  };
  return classes[statut] || "badge";
}

// =============================================
// RENDU DU TABLEAU — remplit le tbody avec les données
// =============================================
function renderizarTabela(dados) {
  const tbody = document.getElementById("tbody");

  // message si aucun résultat
  if (dados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem; color:#64748b;">
          Aucun résultat pour cette requête.
        </td>
      </tr>`;
    document.getElementById("count").textContent = "0 résultat";
    return;
  }

  // génère une ligne HTML par client
  tbody.innerHTML = dados.map(c => `
    <tr>
      <td>${c.nom}</td>
      <td>${c.ville}</td>
      <td><span class="${badgeTipo(c.type_envoi)}">${c.type_envoi}</span></td>
      <td><span class="${badgeStatut(c.statut)}">${c.statut}</span></td>
      <td>
        <button
          class="btn-apercu"
          onclick="abrirModal('${c.nom}', '${c.type_envoi}', '${c.ville}')">
          Aperçu
        </button>
      </td>
    </tr>
  `).join("");

  // met à jour le compteur de résultats
  const texto = dados.length === 1 ? "1 résultat" : `${dados.length} résultats`;
  document.getElementById("count").textContent = texto;
}

// =============================================
// REQUÊTE SQL — met à jour l'aperçu en temps réel
// =============================================
function atualizarQuery() {
  const ville      = document.getElementById("f-ville").value;
  const tipo       = document.getElementById("f-type").value;
  const statut     = document.getElementById("f-statut").value;

  let query = `<span class="kw">SELECT</span> * <span class="kw">FROM</span> clients <span class="kw">WHERE</span> 1=1`;

  if (ville)  query += ` <span class="kw">AND</span> ville = <span class="val">'${ville}'</span>`;
  if (tipo)   query += ` <span class="kw">AND</span> type_envoi = <span class="val">'${tipo}'</span>`;
  if (statut) query += ` <span class="kw">AND</span> statut = <span class="val">'${statut}'</span>`;

  document.getElementById("sql-preview").innerHTML = query;
}

// =============================================
// FILTRER — appelle l'API avec les paramètres de filtre
// =============================================
async function filtrar() {
  const ville  = document.getElementById("f-ville").value;
  const tipo   = document.getElementById("f-type").value;
  const statut = document.getElementById("f-statut").value;

  // construit l'URL avec les query params
  const params = new URLSearchParams();
  if (ville)  params.append("ville",      ville);
  if (tipo)   params.append("type_envoi", tipo);
  if (statut) params.append("statut",     statut);

  try {
    // appel réel à l'API — comme un WHERE en SQL
    const resposta = await fetch(`${API}?${params.toString()}`);
    const dados    = await resposta.json();

    atualizarQuery();
    renderizarTabela(dados);
    await atualizarMetricas(dados);

  } catch (erro) {
    console.error("Erreur lors de la récupération des données :", erro);
  }
}

// =============================================
// LOG D'ÉVÉNEMENTS — données statiques d'exemple
// =============================================
const eventos = [
  { time: "09:12:03", msg: "SMS → Marie Laurent (Valence)",     ok: true  },
  { time: "09:15:47", msg: "Mail → Jean Dupont (Lyon)",         ok: true  },
  { time: "09:18:22", msg: "Erreur SMS → Claire Morel (Paris)", ok: false },
  { time: "09:21:10", msg: "Mail → Pierre Blanc (Grenoble)",    ok: true  },
  { time: "09:30:55", msg: "Mail → Thomas Petit (Valence)",     ok: true  },
  { time: "09:45:01", msg: "Erreur Mail → Camille Roux (Lyon)", ok: false },
];

function renderizarLog() {
  const container = document.getElementById("log-container");

  container.innerHTML = eventos.map(e => `
    <div class="log-entry">
      <span class="log-time">${e.time}</span>
      <span class="${e.ok ? "log-status-ok" : "log-status-err"}">${e.ok ? "✓" : "✗"}</span>
      <span class="log-msg">${e.msg}</span>
    </div>
  `).join("");
}

// =============================================
// MODAL — ouvre et génère la maquette personnalisée
// =============================================
function abrirModal(nom, tipo, ville) {
  let conteudo = "";
  const prenom = nom.split(" ")[0];

  if (tipo === "SMS") {
    conteudo =
`[MESSAGE SMS AUTOMATIQUE]

Bonjour ${prenom},

Votre dossier bancaire a été mis à jour.
Merci de vous connecter à votre espace client
ou de contacter votre conseiller.

— Service Éditique`;

  } else if (tipo === "Mail") {
    conteudo =
`Objet : Mise à jour de votre compte

Bonjour ${nom},

Nous vous informons d'une mise à jour concernant
votre compte domicilié à ${ville}.

Pour toute question, n'hésitez pas à contacter
votre conseiller bancaire.

Cordialement,
Le Service Clients`;

  } else if (tipo === "Courrier") {
    conteudo =
`[COURRIER POSTAL]

${nom}
${ville}, France

Madame, Monsieur,

Veuillez trouver ci-joint les documents
relatifs à votre dossier bancaire.

Nous restons à votre disposition pour
tout renseignement complémentaire.

Cordialement,
Le Service Éditique`;
  }

  document.getElementById("modal-title").textContent = `Maquette — ${tipo}`;
  document.getElementById("modal-body").textContent  = conteudo;
  document.getElementById("modal").classList.add("open");
}

// =============================================
// FERMER LE MODAL
// =============================================
function fecharModal() {
  document.getElementById("modal").classList.remove("open");
}

// =============================================
// ÉVÉNEMENTS — attache les listeners aux éléments
// =============================================
document.getElementById("btn-executer").addEventListener("click", filtrar);

document.getElementById("f-ville").addEventListener("change",  atualizarQuery);
document.getElementById("f-type").addEventListener("change",   atualizarQuery);
document.getElementById("f-statut").addEventListener("change", atualizarQuery);

document.getElementById("modal-close").addEventListener("click", fecharModal);

document.getElementById("modal").addEventListener("click", function(e) {
  // ferme le modal si on clique sur l'overlay et non à l'intérieur
  if (e.target === this) fecharModal();
});

// =============================================
// INITIALISATION — exécuté au chargement de la page
// =============================================
async function init() {
  try {
    // charge tous les clients depuis l'API au démarrage
    const dados = await fetch(API).then(r => r.json());
    renderizarTabela(dados);
    renderizarLog();
    await atualizarMetricas(dados);
    atualizarQuery();
  } catch (erro) {
    console.error("Erreur d'initialisation :", erro);
  }
}

init();