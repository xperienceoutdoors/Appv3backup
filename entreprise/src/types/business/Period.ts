export interface DaySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Period {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  schedules: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
  activities: string[];
  isActive: boolean;
}

export type PeriodType = {
  id: string;
  startDate: string;
  endDate: string;
  activities: string[];
  schedule: DaySchedule[];
}

// Pour la validation
export interface PeriodValidation {
  hasValidDates: boolean;    // Les dates sont-elles valides ?
  hasActivity: boolean;      // Une activité est-elle sélectionnée ?
  hasActiveDays: boolean;    // Au moins un jour actif ?
  hasValidSchedule: boolean; // Les horaires sont-ils cohérents ?
  isValid: boolean;         // La période est-elle globalement valide ?
  errors: string[];         // Messages d'erreur détaillés
}

// Pour les réductions en période creuse
export interface OffPeakDiscount {
  activityId: string;
  formulaId: string;
  discountPercentage: number; // Pourcentage de réduction
}
