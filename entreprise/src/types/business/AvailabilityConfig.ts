import { Period } from './Period';
import { Resource } from './Resource';
import { Formula } from './Formula';

export interface TimeSlotConfig {
  defaultDuration: number;  // Durée par défaut en minutes
  minStartTime: string;     // Ex: "09:00"
  maxEndTime: string;       // Ex: "18:00"
  intervalMinutes: number;  // Ex: 30 (pour des créneaux toutes les 30 minutes)
  bufferMinutes: number;    // Temps entre deux réservations
}

export interface ResourceAllocationRule {
  resourceId: string;
  // Règles d'allocation des ressources
  maxConcurrentBookings: number;    // Nombre max de réservations simultanées
  minTimeBetweenBookings: number;   // Temps minimum entre deux réservations
  quantityPerBooking: number;       // Quantité nécessaire par réservation
}

export interface AvailabilityConfig {
  activityId: string;
  
  // Configuration des créneaux
  timeSlots: TimeSlotConfig;
  
  // Règles de réservation
  maxParticipantsPerSlot: number;
  minParticipantsPerSlot: number;
  maxAdvanceBookingDays: number;    // Combien de jours à l'avance on peut réserver
  minAdvanceBookingHours: number;   // Délai minimum avant une réservation
  
  // Gestion des ressources
  resourceRules: ResourceAllocationRule[];
  
  // Règles de chevauchement
  allowOverlapping: boolean;        // Autoriser les réservations simultanées
  maxOverlappingBookings: number;   // Si oui, combien maximum
  
  // Règles spéciales
  seasonalRules?: {
    periodId: string;
    timeSlotOverrides?: Partial<TimeSlotConfig>;
    maxParticipantsOverride?: number;
  }[];
  
  // Règles de tarification dynamique
  dynamicPricing?: {
    peakHourMultiplier: number;     // Multiplicateur pour les heures de pointe
    lastMinuteDiscount: number;     // Réduction dernière minute (%)
    earlyBirdDiscount: number;      // Réduction réservation anticipée (%)
  };
}

// Type pour la validation de la configuration
export interface AvailabilityConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
