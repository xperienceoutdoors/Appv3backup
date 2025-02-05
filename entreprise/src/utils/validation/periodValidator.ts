import { Period, PeriodValidation, DaySchedule } from '../../types/business/Period';
import { Activity } from '../../types/business/Activity';

export function validatePeriod(
  period: Period,
  activities: Activity[]
): PeriodValidation {
  const validation: PeriodValidation = {
    hasValidDates: true,
    hasActivity: false,
    hasActiveDays: false,
    hasValidSchedule: true,
    isValid: false,
    errors: []
  };

  // Validation des dates
  const now = new Date();
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    validation.hasValidDates = false;
    validation.errors.push('Les dates de début et/ou de fin sont invalides');
  } else if (startDate >= endDate) {
    validation.hasValidDates = false;
    validation.errors.push('La date de début doit être antérieure à la date de fin');
  }

  // Validation des activités
  if (!period.activities || period.activities.length === 0) {
    validation.hasActivity = false;
    validation.errors.push('Au moins une activité doit être sélectionnée');
  } else {
    const invalidActivities = period.activities.filter(
      id => !activities.find(a => a.id === id)
    );
    if (invalidActivities.length > 0) {
      validation.hasActivity = false;
      validation.errors.push(`Activités non trouvées: ${invalidActivities.join(', ')}`);
    } else {
      validation.hasActivity = true;
    }
  }

  // Validation du planning
  if (!period.schedule || period.schedule.length !== 7) {
    validation.hasValidSchedule = false;
    validation.errors.push('Le planning doit être défini pour les 7 jours de la semaine');
  } else {
    // Vérification des jours actifs et des horaires
    validation.hasActiveDays = period.schedule.some(day => day.isActive);
    
    if (!validation.hasActiveDays) {
      validation.errors.push('Au moins un jour doit être actif');
    }

    period.schedule.forEach((day: DaySchedule) => {
      if (day.isActive) {
        // Validation des horaires de base
        const startTime = parseTimeString(day.startTime);
        const endTime = parseTimeString(day.endTime);
        
        if (!startTime || !endTime) {
          validation.hasValidSchedule = false;
          validation.errors.push(`Horaires invalides pour le jour ${day.dayOfWeek}`);
        } else if (startTime >= endTime) {
          validation.hasValidSchedule = false;
          validation.errors.push(`L'heure de début doit être avant l'heure de fin pour le jour ${day.dayOfWeek}`);
        }

        // Validation des pauses
        if (day.breakStartTime && day.breakEndTime) {
          const breakStart = parseTimeString(day.breakStartTime);
          const breakEnd = parseTimeString(day.breakEndTime);

          if (!breakStart || !breakEnd) {
            validation.hasValidSchedule = false;
            validation.errors.push(`Horaires de pause invalides pour le jour ${day.dayOfWeek}`);
          } else if (breakStart >= breakEnd) {
            validation.hasValidSchedule = false;
            validation.errors.push(`L'heure de début de pause doit être avant l'heure de fin pour le jour ${day.dayOfWeek}`);
          } else if (breakStart < startTime || breakEnd > endTime) {
            validation.hasValidSchedule = false;
            validation.errors.push(`La pause doit être comprise dans les horaires d'ouverture pour le jour ${day.dayOfWeek}`);
          }
        }
      }
    });
  }

  // Validation globale
  validation.isValid = (
    validation.hasValidDates &&
    validation.hasActivity &&
    validation.hasActiveDays &&
    validation.hasValidSchedule
  );

  return validation;
}

// Fonction utilitaire pour parser les heures au format "HH:mm"
function parseTimeString(timeStr: string): Date | null {
  if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
    return null;
  }

  const [hours, minutes] = timeStr.split(':').map(Number);
  if (
    isNaN(hours) || isNaN(minutes) ||
    hours < 0 || hours > 23 ||
    minutes < 0 || minutes > 59
  ) {
    return null;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}
