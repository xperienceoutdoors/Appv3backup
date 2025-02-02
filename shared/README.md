# Code Partagé

Ce dossier contient le code et les composants partagés entre les applications super-admin et entreprise.

## Contenu

```
/shared
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI génériques (boutons, inputs, etc.)
│   ├── forms/          # Composants de formulaires
│   └── layout/         # Composants de mise en page
├── hooks/              # Hooks React partagés
├── utils/              # Utilitaires communs
│   ├── api/            # Client API et intercepteurs
│   ├── validation/     # Fonctions de validation
│   └── formatting/     # Fonctions de formatage
├── types/              # Types TypeScript partagés
└── constants/          # Constants partagées
```

## Utilisation

Pour utiliser les composants partagés dans les applications, il suffit de les importer depuis le dossier shared :

```typescript
import { Button } from '@shared/components/ui';
import { useAuth } from '@shared/hooks';
import { formatDate } from '@shared/utils/formatting';
```

## Bonnes pratiques

1. Ne mettre dans ce dossier que du code véritablement réutilisé
2. Maintenir une documentation claire pour chaque composant
3. Écrire des tests pour tout le code partagé
4. Versionner les composants si nécessaire
