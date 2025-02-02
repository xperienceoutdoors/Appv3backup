# Application de Réservation Nautique

## Structure du Projet

```
/
├── backend/                    # API et logique métier
│   ├── src/
│   │   ├── api/               # Points d'entrée API
│   │   ├── auth/              # Authentification et autorisation
│   │   ├── models/            # Modèles de données
│   │   │   ├── company/       # Modèles liés aux entreprises
│   │   │   ├── booking/       # Modèles liés aux réservations
│   │   │   └── user/          # Modèles utilisateurs
│   │   ├── services/          # Services métier
│   │   └── utils/             # Utilitaires
│   ├── tests/                 # Tests unitaires et d'intégration
│   └── config/                # Configuration du backend
│
├── frontend/
│   ├── src/
│   │   ├── admin/            # Interface super administrateur
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── company/          # Interface entreprise (back-office)
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   └── client/           # Interface client
│   │       ├── components/
│   │       ├── pages/
│   │       └── services/
│   └── public/               # Assets statiques
│
├── shared/                   # Code partagé entre frontend et backend
│   ├── types/               # Types TypeScript
│   ├── constants/           # Constants partagées
│   └── utils/               # Utilitaires partagés
│
└── docs/                    # Documentation
    ├── api/                 # Documentation API
    ├── deployment/          # Guide de déploiement
    └── development/         # Guide de développement
```

## Points Clés de l'Architecture

1. **Séparation Backend/Frontend**
   - Backend : API REST/GraphQL pour la logique métier
   - Frontend : Applications distinctes pour chaque type d'utilisateur

2. **Modularité**
   - Chaque interface utilisateur est indépendante
   - Code partagé centralisé dans le dossier `shared/`

3. **Sécurité**
   - Authentification et autorisation centralisées
   - Isolation des interfaces utilisateur

4. **Extensibilité**
   - Structure permettant l'ajout facile de nouvelles fonctionnalités
   - Architecture modulaire pour la maintenance

## Prérequis Techniques

- Node.js
- Base de données (à définir : PostgreSQL recommandé)
- Framework Frontend (React recommandé)
- Framework Backend (Node.js/Express ou NestJS recommandé)

## Installation et Développement

Instructions à venir...
