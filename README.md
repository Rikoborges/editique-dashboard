# Éditique Dashboard

Interface de gestion des envois éditiques — publipostage, SMS, mails et courriers.

## Stack technique

- HTML / CSS / JavaScript (vanilla)
- Node.js + Express
- SQLite (better-sqlite3)
- API REST (GET, POST, PUT, DELETE)

## Fonctionnalités

- Filtres dynamiques avec requête SQL en temps réel
- Tableau de clients connecté à une base SQLite
- Maquettes de documents personnalisées (SMS, Mail, Courrier)
- Log d'événements d'envoi
- Interface responsive — mobile et desktop

## Lancer le projet

```bash
npm install
node server/server.js
```

Ouvrir ensuite : http://localhost:3000

## Structure

```
editique-dashboard/
├── index.html
├── css/style.css
├── js/main.js
└── server/
    ├── server.js
    └── database.js
```