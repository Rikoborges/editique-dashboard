# Éditique Dashboard

Interface de gestion des opérations éditiques — publipostage, SMS, mails et courriers postaux.  
Projet démonstratif réalisé dans le cadre d'une candidature au poste d'Assistant Production et Projet Éditique.

🔗 **Demo live : [editique-dashboard.onrender.com](https://editique-dashboard.onrender.com)**

---

## Objectif

Simuler un environnement de production éditique bancaire avec :
- Gestion d'une base de clients connectée à PostgreSQL
- Filtres dynamiques avec requête SQL visible en temps réel
- Génération de maquettes de documents personnalisés (SMS, Mail, Courrier)
- Log d'événements d'envoi horodatés
- Interface responsive adaptée aux environnements professionnels

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | HTML5 · CSS3 · JavaScript (vanilla) |
| Backend | Node.js · Express |
| Base de données | PostgreSQL hébergé sur Neon |
| API | REST — GET · POST · PUT · DELETE |
| Deploy | Render |

---

## Fonctionnalités

- **Requêtes SQL dynamiques** — les filtres génèrent une clause WHERE visible en temps réel
- **Base PostgreSQL cloud** — connectée à Neon, données persistantes
- **API REST complète** — routes pour lire, filtrer, créer, modifier et supprimer
- **Publipostage** — maquettes personnalisées par client et par type d'envoi (SMS, Mail, Courrier)
- **Log d'événements** — historique horodaté des envois avec statut succès/erreur
- **Interface responsive** — mobile et desktop

---

## Lancer le projet en local

    git clone https://github.com/Rikoborges/editique-dashboard.git
    cd editique-dashboard
    npm install

Créer un fichier `.env` à la racine :

    DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require

Démarrer le serveur :

    node server/server.js

Ouvrir ensuite : http://localhost:3000

---

## API — Routes disponibles

| Méthode | Route | Description |
|---|---|---|
| GET | /api/clients | Récupère tous les clients |
| GET | /api/clients?ville=Valence | Filtre par ville |
| GET | /api/clients?type_envoi=SMS | Filtre par type d'envoi |
| GET | /api/clients?statut=Envoyé | Filtre par statut |
| GET | /api/clients/:id | Récupère un client par ID |
| POST | /api/clients | Crée un nouveau client |
| PUT | /api/clients/:id | Met à jour le statut |
| DELETE | /api/clients/:id | Supprime un client |

---

## Structure du projet

    editique-dashboard/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── main.js
    ├── server/
    │   ├── server.js
    │   └── database.js
    ├── .env.example
    ├── .gitignore
    ├── package.json
    └── README.md

---

## Auteur

**Ricardo Borges** — Développeur Full Stack en formation  
[github.com/Rikoborges](https://github.com/Rikoborges) · [linkedin.com/in/ricardoduarteborges](https://linkedin.com/in/ricardoduarteborges)