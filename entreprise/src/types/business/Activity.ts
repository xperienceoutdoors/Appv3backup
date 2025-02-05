import { Resource } from './Resource';

export interface ActivityDuration {
  duration: number;         // Durée en minutes
  setupTime: number;        // Temps de préparation en minutes
  cleanupTime: number;      // Temps de nettoyage en minutes
}

export interface ActivityPricing {
  basePrice: number;        // Prix de base
}

export interface ActivityResources {
  resourceId: string;       // ID de la ressource
  quantity: number;         // Nombre d'unités nécessaires
  id?: string;              // Pour la compatibilité avec le service d'availability
}

export type PaymentMethod = 'onsite' | 'deposit' | 'full';

export interface PaymentSettings {
  depositRequired: boolean;
  depositAmount: number;
  depositType: string;
}

export interface Formula {
  id: string;
  name: string;
  description: string;
  duration: number;
  isActive: boolean;
  timeSlots: { time: string }[];
  rates: {
    id: string;
    name: string;
    price: number;
    vat: number;
  }[];
  activityId?: string;      // Pour la compatibilité avec le service d'availability
  interval?: number;        // Pour la compatibilité avec le service d'availability
  price?: number;           // Pour la compatibilité avec le service d'availability
}

export interface Activity {
  id: string;
  name: string;            // Nom de l'activité
  description: string;     // Description détaillée
  process: string;         // Déroulement de l'activité
  goodToKnow: string;      // Bon à savoir
  included: string;        // Inclus dans l'offre
  shortDescription: string; // Description courte pour les listes
  duration: ActivityDuration;
  pricing: ActivityPricing;
  resources: ActivityResources[];
  categoryId?: string;
  formulas: Formula[];     // Liste des formules, initialisée comme tableau vide par défaut
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  maxParticipants: number; // Nombre maximum de participants par session
  minParticipants?: number; // Nombre minimum de participants
  isOnline: boolean;       // Si l'activité est visible en ligne
  imageUrl?: string;       // URL de l'image principale
  imageFile?: File;        // Fichier image temporaire pour l'upload
  categories: string[];    // IDs des catégories
  color?: string;         // Couleur pour l'affichage dans le calendrier
  notes?: string;         // Notes internes
  paymentSettings: PaymentSettings;
  properties?: {          // Propriétés additionnelles
    [key: string]: string | number | boolean;
  };
}

// Pour la validation
export interface ActivityValidation {
  hasValidName: boolean;
  hasValidDuration: boolean;
  hasValidPricing: boolean;
  hasValidResources: boolean;
  errors: string[];
}
