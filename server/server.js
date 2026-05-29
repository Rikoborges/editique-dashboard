// =============================================
// DÉPENDANCES
// =============================================
const express = require("express");
const path    = require("path");
const db      = require("./database");

const app  = express();
const PORT = 3000;

// =============================================
// MIDDLEWARES
// =============================================

// permet de lire le JSON dans le body des requêtes POST
app.use(express.json());

// sert les fichiers statiques (index.html, css, js) depuis la racine
app.use(express.static(path.join(__dirname, "..")));

// =============================================
// ROUTES — GET /api/clients
// récupère tous les clients avec filtres optionnels
// =============================================
app.get("/api/clients", (req, res) => {
  const { ville, type_envoi, statut } = req.query;

  // construction dynamique de la requête SQL
  let sql    = "SELECT * FROM clients WHERE 1=1";
  const params = [];

  if (ville) {
    sql += " AND ville = ?";
    params.push(ville);
  }

  if (type_envoi) {
    sql += " AND type_envoi = ?";
    params.push(type_envoi);
  }

  if (statut) {
    sql += " AND statut = ?";
    params.push(statut);
  }

  // exécute la requête et retourne les résultats en JSON
  const clients = db.prepare(sql).all(...params);
  res.json(clients);
});

// =============================================
// ROUTE — GET /api/clients/:id
// récupère un seul client par son ID
// =============================================
app.get("/api/clients/:id", (req, res) => {
  const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(req.params.id);

  // retourne 404 si le client n'existe pas
  if (!client) {
    return res.status(404).json({ erreur: "Client introuvable." });
  }

  res.json(client);
});

// =============================================
// ROUTE — POST /api/clients
// insère un nouveau client dans la base
// =============================================
app.post("/api/clients", (req, res) => {
  const { nom, ville, type_envoi, statut } = req.body;

  // validation basique des champs obligatoires
  if (!nom || !ville || !type_envoi || !statut) {
    return res.status(400).json({ erreur: "Tous les champs sont obligatoires." });
  }

  const result = db.prepare(`
    INSERT INTO clients (nom, ville, type_envoi, statut)
    VALUES (?, ?, ?, ?)
  `).run(nom, ville, type_envoi, statut);

  // retourne le nouveau client créé avec son ID généré
  res.status(201).json({ id: result.lastInsertRowid, nom, ville, type_envoi, statut });
});

// =============================================
// ROUTE — PUT /api/clients/:id
// met à jour le statut d'un client existant
// =============================================
app.put("/api/clients/:id", (req, res) => {
  const { statut } = req.body;

  if (!statut) {
    return res.status(400).json({ erreur: "Le champ statut est obligatoire." });
  }

  const result = db.prepare(`
    UPDATE clients SET statut = ? WHERE id = ?
  `).run(statut, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ erreur: "Client introuvable." });
  }

  res.json({ message: "Statut mis à jour avec succès." });
});

// =============================================
// ROUTE — DELETE /api/clients/:id
// supprime un client de la base
// =============================================
app.delete("/api/clients/:id", (req, res) => {
  const result = db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ erreur: "Client introuvable." });
  }

  res.json({ message: "Client supprimé avec succès." });
});

// =============================================
// DÉMARRAGE DU SERVEUR
// =============================================
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});