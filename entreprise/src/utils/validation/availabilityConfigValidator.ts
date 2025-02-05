import { AvailabilityConfig, AvailabilityConfigValidation } from '../../types/business/AvailabilityConfig';
import { Period } from '../../types/business/Period';
import { Resource } from '../../types/business/Resource';

export function validateAvailabilityConfig(
  config: AvailabilityConfig,
  periods: Period[],
  resources: Resource[]
): AvailabilityConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validation des créneaux horaires
  const { timeSlots } = config;
  if (timeSlots.defaultDuration <= 0) {
    errors.push('La durée par défaut doit être positive');
  }
  if (timeSlots.intervalMinutes <= 0) {
    errors.push('L\'intervalle entre les créneaux doit être positif');
  }
  if (timeSlots.bufferMinutes < 0) {
    errors.push('Le temps tampon ne peut pas être négatif');
  }

  // Validation des horaires
  const startTime = new Date(`2000-01-01T${timeSlots.minStartTime}`);
  const endTime = new Date(`2000-01-01T${timeSlots.maxEndTime}`);
  if (startTime >= endTime) {
    errors.push('L\'heure de début doit être avant l\'heure de fin');
  }

  // Validation des participants
  if (config.maxParticipantsPerSlot < config.minParticipantsPerSlot) {
    errors.push('Le nombre maximum de participants doit être supérieur au minimum');
  }
  if (config.minParticipantsPerSlot < 1) {
    errors.push('Le nombre minimum de participants doit être d\'au moins 1');
  }

  // Validation des délais de réservation
  if (config.maxAdvanceBookingDays < 0) {
    errors.push('Le délai maximum de réservation ne peut pas être négatif');
  }
  if (config.minAdvanceBookingHours < 0) {
    errors.push('Le délai minimum de réservation ne peut pas être négatif');
  }

  // Validation des ressources
  for (const rule of config.resourceRules) {
    const resource = resources.find(r => r.id === rule.resourceId);
    if (!resource) {
      errors.push(`Ressource ${rule.resourceId} non trouvée`);
      continue;
    }
    if (rule.maxConcurrentBookings <= 0) {
      errors.push(`Le nombre maximum de réservations simultanées pour ${resource.name} doit être positif`);
    }
    if (rule.quantityPerBooking <= 0) {
      errors.push(`La quantité par réservation pour ${resource.name} doit être positive`);
    }
  }

  // Validation du chevauchement
  if (config.allowOverlapping && config.maxOverlappingBookings <= 0) {
    errors.push('Le nombre maximum de réservations simultanées doit être positif si le chevauchement est autorisé');
  }

  // Validation des règles saisonnières
  if (config.seasonalRules) {
    for (const rule of config.seasonalRules) {
      const period = periods.find(p => p.id === rule.periodId);
      if (!period) {
        errors.push(`Période ${rule.periodId} non trouvée`);
        continue;
      }

      if (rule.timeSlotOverrides) {
        const { timeSlotOverrides } = rule;
        if (timeSlotOverrides.defaultDuration !== undefined && timeSlotOverrides.defaultDuration <= 0) {
          errors.push(`La durée par défaut pour la période ${period.name} doit être positive`);
        }
      }

      if (rule.maxParticipantsOverride !== undefined && rule.maxParticipantsOverride < config.minParticipantsPerSlot) {
        errors.push(`Le nombre maximum de participants pour la période ${period.name} doit être supérieur au minimum global`);
      }
    }
  }

  // Validation de la tarification dynamique
  if (config.dynamicPricing) {
    const { peakHourMultiplier, lastMinuteDiscount, earlyBirdDiscount } = config.dynamicPricing;
    
    if (peakHourMultiplier <= 0) {
      errors.push('Le multiplicateur pour les heures de pointe doit être positif');
    }
    if (lastMinuteDiscount < 0 || lastMinuteDiscount > 100) {
      errors.push('La réduction dernière minute doit être entre 0 et 100%');
    }
    if (earlyBirdDiscount < 0 || earlyBirdDiscount > 100) {
      errors.push('La réduction réservation anticipée doit être entre 0 et 100%');
    }
  }

  // Avertissements
  if (timeSlots.bufferMinutes === 0) {
    warnings.push('Aucun temps tampon entre les réservations');
  }
  if (config.maxAdvanceBookingDays > 365) {
    warnings.push('Le délai maximum de réservation est supérieur à un an');
  }
  if (config.allowOverlapping && config.maxOverlappingBookings > 5) {
    warnings.push('Nombre élevé de réservations simultanées autorisées');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
