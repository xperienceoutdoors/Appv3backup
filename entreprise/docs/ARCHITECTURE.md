# Architecture de l'Application

## Structure des Dossiers

- `/src/components` : Composants React réutilisables
- `/src/layouts` : Layouts de l'application
- `/src/pages` : Pages principales de l'application
- `/src/services` : Services métier et API
- `/src/types` : Types TypeScript et interfaces
- `/src/utils` : Utilitaires et helpers

## Modèle de Données

### Disponibilités et Réservations

Le système de gestion des disponibilités est basé sur plusieurs concepts clés :

1. **AvailabilityConfig**
   - Configuration des créneaux horaires
   - Règles de réservation
   - Gestion des ressources
   - Règles de chevauchement
   - Tarification dynamique

2. **Périodes**
   - Gestion des saisons
   - Horaires par jour
   - Périodes creuses et pleines
   - Réductions spéciales

3. **Ressources**
   - Allocation des ressources
   - Règles de disponibilité
   - Capacités maximales

## Workflows Principaux

1. **Réservation d'une Activité**
   ```
   Sélection Activité → Choix Date → Vérification Disponibilité → Sélection Créneau → Réservation
   ```

2. **Gestion des Disponibilités**
   ```
   Configuration Période → Définition Règles → Application Tarification → Validation
   ```

## Bonnes Pratiques

1. **Composants**
   - Utiliser des composants fonctionnels avec hooks
   - Séparer la logique métier des composants UI
   - Maintenir des composants petits et focalisés

2. **Services**
   - Centraliser les appels API dans les services
   - Utiliser des types stricts
   - Gérer les erreurs de manière cohérente

3. **État**
   - Utiliser les contexts React pour l'état global
   - Préférer les états locaux quand possible
   - Maintenir un état immutable

## Validation et Tests

1. **Types**
   - Utiliser TypeScript strictement
   - Définir des interfaces claires
   - Valider les données à l'entrée

2. **Tests**
   - Tests unitaires pour les services
   - Tests d'intégration pour les workflows
   - Tests de validation pour les règles métier
