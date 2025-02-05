import { AvailabilityConfig, AvailabilityConfigValidation } from '../types/business/AvailabilityConfig';

class AvailabilityConfigService {
  private readonly STORAGE_KEY = 'availability_configs';

  // Récupère la configuration pour une activité
  async getConfig(activityId: string): Promise<AvailabilityConfig | null> {
    const configs = await this.getAllConfigs();
    return configs.find(config => config.activityId === activityId) || null;
  }

  // Sauvegarde ou met à jour une configuration
  async saveConfig(config: AvailabilityConfig): Promise<AvailabilityConfig> {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const configs = await this.getAllConfigs();
    const index = configs.findIndex(c => c.activityId === config.activityId);

    if (index !== -1) {
      configs[index] = config;
    } else {
      configs.push(config);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    return config;
  }

  // Valide une configuration
  validateConfig(config: AvailabilityConfig): AvailabilityConfigValidation {
    const errors: string[] = [];

    // Vérifier les champs requis
    if (!config.activityId) {
      errors.push('L\'ID de l\'activité est requis');
    }

    if (!config.timeSlots) {
      errors.push('La configuration des créneaux horaires est requise');
    } else {
      // Vérifier le format des horaires
      if (!this.isValidTimeFormat(config.timeSlots.minStartTime)) {
        errors.push('L\'heure de début minimum n\'est pas valide');
      }
      if (!this.isValidTimeFormat(config.timeSlots.maxEndTime)) {
        errors.push('L\'heure de fin maximum n\'est pas valide');
      }
      if (config.timeSlots.minStartTime >= config.timeSlots.maxEndTime) {
        errors.push('L\'heure de début doit être avant l\'heure de fin');
      }
    }

    // Vérifier les valeurs numériques
    if (config.maxParticipantsPerSlot < 1) {
      errors.push('Le nombre maximum de participants par créneau doit être supérieur à 0');
    }
    if (config.minParticipantsPerSlot < 1) {
      errors.push('Le nombre minimum de participants par créneau doit être supérieur à 0');
    }
    if (config.minParticipantsPerSlot > config.maxParticipantsPerSlot) {
      errors.push('Le nombre minimum de participants ne peut pas être supérieur au maximum');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Génère une configuration par défaut pour une activité
  generateDefaultConfig(activityId: string): AvailabilityConfig {
    return {
      activityId,
      timeSlots: {
        minStartTime: '09:00',
        maxEndTime: '18:00',
        defaultDuration: 60,
        intervalMinutes: 30
      },
      maxParticipantsPerSlot: 10,
      minParticipantsPerSlot: 1,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 24,
      resourceRules: [],
      allowOverlapping: false,
      maxOverlappingBookings: 0,
      dynamicPricing: {
        peakHourMultiplier: 1.2,
        lastMinuteDiscount: 20,
        earlyBirdDiscount: 10
      }
    };
  }

  // Méthodes privées
  private async getAllConfigs(): Promise<AvailabilityConfig[]> {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private isValidTimeFormat(time: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }
}

export const availabilityConfigService = new AvailabilityConfigService();
export default availabilityConfigService;
