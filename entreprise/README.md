# Back-office Entreprises

Ce dossier contient l'application dédiée aux entreprises de loisirs nautiques.

## Fonctionnalités principales

- Gestion du profil entreprise
- Gestion des activités et du matériel
- Gestion des réservations
- Planning et disponibilités
- Statistiques de vente

## Structure du dossier

```
/entreprise
├── src/
│   ├── components/       # Composants React réutilisables
│   │   ├── booking/     # Composants liés aux réservations
│   │   ├── calendar/    # Composants de planning
│   │   └── inventory/   # Composants de gestion du matériel
│   ├── pages/           # Pages de l'application
│   ├── services/        # Services et logique métier
│   ├── hooks/           # Hooks React personnalisés
│   └── utils/           # Utilitaires
├── public/              # Assets statiques
└── tests/               # Tests unitaires et d'intégration
```
