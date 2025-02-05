# Règles Métier

## Gestion des Disponibilités

### 1. Créneaux Horaires
- Chaque activité a une durée par défaut
- Les créneaux sont définis par des intervalles réguliers
- Un temps tampon peut être configuré entre les réservations
- Les horaires peuvent être différents selon les périodes

### 2. Capacité et Participants
- Nombre minimum et maximum de participants par créneau
- Possibilité de chevauchement des réservations avec limite configurable
- Gestion des ressources nécessaires par activité

### 3. Règles de Réservation
- Délai minimum avant une réservation (ex: 2h)
- Délai maximum de réservation à l'avance (ex: 60 jours)
- Validation des ressources disponibles
- Vérification des conflits de planning

### 4. Périodes et Tarification
- Définition de périodes (haute/basse saison)
- Horaires spécifiques par période
- Tarification dynamique :
  - Multiplicateur heures de pointe
  - Réduction dernière minute
  - Réduction réservation anticipée
- Réductions spéciales en période creuse

### 5. Ressources
- Allocation par activité
- Gestion des quantités disponibles
- Règles de réservation simultanée
- Temps minimum entre deux utilisations

## Workflow de Réservation

1. **Sélection de l'Activité**
   - Vérification des périodes actives
   - Application des règles saisonnières

2. **Choix de la Date**
   - Vérification des délais (min/max)
   - Application des horaires de la période

3. **Sélection du Créneau**
   - Vérification des disponibilités
   - Calcul du prix (tarification dynamique)
   - Vérification des ressources

4. **Finalisation**
   - Validation des participants
   - Application des réductions
   - Réservation des ressources

## Règles de Validation

### Configuration des Disponibilités
- Durées et intervalles positifs
- Cohérence des horaires
- Validité des ressources référencées
- Limites de participants cohérentes

### Périodes
- Dates de début et fin valides
- Au moins un jour actif
- Horaires cohérents
- Activités correctement référencées

### Ressources
- Quantités positives
- Règles d'allocation valides
- Temps de préparation cohérents

## Gestion des Conflits

1. **Chevauchement des Réservations**
   - Vérification de la capacité maximale
   - Respect des règles de chevauchement
   - Disponibilité des ressources

2. **Modification/Annulation**
   - Délais de modification
   - Impact sur les ressources
   - Règles de remboursement

3. **Cas Particuliers**
   - Fermetures exceptionnelles
   - Maintenance des ressources
   - Événements spéciaux
