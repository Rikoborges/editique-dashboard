// =============================================
// CONNEXION À LA BASE DE DONNÉES SQLite
// =============================================
const Database = require("better-sqlite3");
const path = require("path");

// crée ou ouvre le fichier db.sqlite dans le dossier server
const db = new Database(path.join(__dirname, "db.sqlite"));

// =============================================
// CRÉATION DE LA TABLE — exécuté seulement si elle n'existe pas
// =============================================
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nom         TEXT    NOT NULL,
    ville       TEXT    NOT NULL,
    type_envoi  TEXT    NOT NULL,
    statut      TEXT    NOT NULL
  )
`);

// =============================================
// SEED — insère les données initiales si la table est vide
// =============================================
const total = db.prepare("SELECT COUNT(*) as total FROM clients").get();

if (total.total === 0) {
  // prepare crée une requête réutilisable — plus efficace qu'un exec en boucle
  const insert = db.prepare(`
    INSERT INTO clients (nom, ville, type_envoi, statut)
    VALUES (@nom, @ville, @type_envoi, @statut)
  `);

  // données initiales — les mêmes que main.js mais stockées dans la vraie base
  const dados = [
    { nom: "Marie Laurent",  ville: "Valence",  type_envoi: "SMS",      statut: "Envoyé"     },
    { nom: "Jean Dupont",    ville: "Lyon",     type_envoi: "Mail",     statut: "Envoyé"     },
    { nom: "Sophie Martin",  ville: "Valence",  type_envoi: "Courrier", statut: "En attente" },
    { nom: "Pierre Blanc",   ville: "Grenoble", type_envoi: "Mail",     statut: "Envoyé"     },
    { nom: "Claire Morel",   ville: "Paris",    type_envoi: "SMS",      statut: "Erreur"     },
    { nom: "Thomas Petit",   ville: "Valence",  type_envoi: "Mail",     statut: "Envoyé"     },
    { nom: "Emma Leroy",     ville: "Lyon",     type_envoi: "Courrier", statut: "En attente" },
    { nom: "Lucas Bernard",  ville: "Grenoble", type_envoi: "SMS",      statut: "Envoyé"     },
    { nom: "Julie Simon",    ville: "Paris",    type_envoi: "Mail",     statut: "Envoyé"     },
    { nom: "Antoine Michel", ville: "Valence",  type_envoi: "Courrier", statut: "En attente" },
    { nom: "Camille Roux",   ville: "Lyon",     type_envoi: "Mail",     statut: "Erreur"     },
    { nom: "Nicolas Girard", ville: "Grenoble", type_envoi: "SMS",      statut: "Envoyé"     },
  ];

  // insère tout dans une transaction — plus rapide et plus sûr
  const inserirTodos = db.transaction((liste) => {
    for (const client of liste) insert.run(client);
  });

  inserirTodos(dados);

  console.log("Base de données créée et alimentée avec succès.");
}

// exporte la base pour utilisation dans server.js
module.exports = db;