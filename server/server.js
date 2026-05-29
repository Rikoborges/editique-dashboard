require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const express = require("express");
const path    = require("path");
const { Pool } = require("pg");

const app  = express();
const PORT = 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// =============================================
// INIT TABLE + SEED
// =============================================
async function inicializar() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id          SERIAL PRIMARY KEY,
      nom         TEXT NOT NULL,
      ville       TEXT NOT NULL,
      type_envoi  TEXT NOT NULL,
      statut      TEXT NOT NULL
    )
  `);

  const { rows } = await pool.query("SELECT COUNT(*) AS total FROM clients");
  if (parseInt(rows[0].total) === 0) {
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
    for (const c of dados) {
      await pool.query(
        "INSERT INTO clients (nom, ville, type_envoi, statut) VALUES ($1, $2, $3, $4)",
        [c.nom, c.ville, c.type_envoi, c.statut]
      );
    }
    console.log("Base de données créée et alimentée avec succès.");
  }
}

// =============================================
// MIDDLEWARES
// =============================================
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// =============================================
// ROUTES
// =============================================
app.get("/api/clients", async (req, res) => {
  const { ville, type_envoi, statut } = req.query;
  let sql = "SELECT * FROM clients WHERE 1=1";
  const params = [];
  let i = 1;

  if (ville)       { sql += ` AND ville = $${i++}`;       params.push(ville);      }
  if (type_envoi)  { sql += ` AND type_envoi = $${i++}`;  params.push(type_envoi); }
  if (statut)      { sql += ` AND statut = $${i++}`;      params.push(statut);     }

  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

app.get("/api/clients/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM clients WHERE id = $1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ erreur: "Client introuvable." });
  res.json(rows[0]);
});

app.post("/api/clients", async (req, res) => {
  const { nom, ville, type_envoi, statut } = req.body;
  if (!nom || !ville || !type_envoi || !statut)
    return res.status(400).json({ erreur: "Tous les champs sont obligatoires." });

  const { rows } = await pool.query(
    "INSERT INTO clients (nom, ville, type_envoi, statut) VALUES ($1, $2, $3, $4) RETURNING *",
    [nom, ville, type_envoi, statut]
  );
  res.status(201).json(rows[0]);
});

app.put("/api/clients/:id", async (req, res) => {
  const { statut } = req.body;
  if (!statut) return res.status(400).json({ erreur: "Le champ statut est obligatoire." });

  const { rowCount } = await pool.query(
    "UPDATE clients SET statut = $1 WHERE id = $2",
    [statut, req.params.id]
  );
  if (rowCount === 0) return res.status(404).json({ erreur: "Client introuvable." });
  res.json({ message: "Statut mis à jour avec succès." });
});

app.delete("/api/clients/:id", async (req, res) => {
  const { rowCount } = await pool.query("DELETE FROM clients WHERE id = $1", [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ erreur: "Client introuvable." });
  res.json({ message: "Client supprimé avec succès." });
});

// =============================================
// DÉMARRAGE
// =============================================
inicializar()
  .then(() => app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`)))
  .catch((err) => { console.error("Erreur init DB:", err); process.exit(1); });
