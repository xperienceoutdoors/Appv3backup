import { Activity } from '../types/business/Activity';
import { Resource } from '../types/business/Resource';
import { Formula } from '../types/business/Formula';

interface Conflict {
  type: 'PERIOD' | 'RESOURCE' | 'CAPACITY';
  message: string;
}

interface AvailabilityResult {
  isAvailable: boolean;
  conflicts: Conflict[];
  assignments?: ResourceAssignment[];
}

interface Reservation {
  id: string;
  activityId: string;
  formulaId: string;
  date: Date;
  startTime: string;
  endTime: string;
  participants: number;
  resources: Array<{
    resourceId: string;
    quantity: number;
  }>;
}

interface ReservationData {
  activity: Activity;
  formula: Formula;
  date: Date;
  startTime: string;
  participants: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface DaySchedule {
  openingTime: string;
  closingTime: string;
  isActive: boolean;
  breakStartTime?: string;
  breakEndTime?: string;
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface ResourceTimeSlot {
  resourceId: string;
  startTime: string;
  endTime: string;
}

interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  availableQuantity: number;
}

interface ResourceAssignment {
  resourceId: string;
  quantity: number;
  startTime: string;
  endTime: string;
}

interface Period {
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  schedule?: Array<{
    dayOfWeek: number;
    isActive: boolean;
  }>;
}

class AvailabilityService {
  private reservations: Reservation[] = [];
  private resourceCache: Map<string, Resource> = new Map();
  private periods: Period[] = [];
  private readonly PERIODS_STORAGE_KEY = 'periods';

  constructor() {
    this.loadPeriodsFromStorage();
  }

  private loadPeriodsFromStorage() {
    try {
      const periodsData = localStorage.getItem(this.PERIODS_STORAGE_KEY);
      if (periodsData) {
        this.periods = JSON.parse(periodsData);
        console.log('Périodes chargées:', this.periods);
      } else {
        // Créer une période par défaut si aucune n'existe
        const defaultPeriod: Period = {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-12-31'),
          isActive: true
        };
        this.periods = [defaultPeriod];
        localStorage.setItem(this.PERIODS_STORAGE_KEY, JSON.stringify(this.periods));
        console.log('Période par défaut créée:', this.periods);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des périodes:', error);
    }
  }

  async checkActivityAvailability(
    activity: Activity,
    formula: Formula,
    date: Date,
    startTime: string,
    endTime: string,
    participants: number
  ): Promise<AvailabilityResult> {
    console.log('[AvailabilityService] Vérification disponibilité:', {
      activityId: activity.id,
      formulaId: formula.id,
      date: date.toISOString(),
      startTime,
      endTime,
      participants
    });

    const conflicts: Conflict[] = [];

    // Vérifier la période
    const periodConflict = await this.checkPeriodConflicts(date, this.periods);
    if (periodConflict) {
      console.log('[AvailabilityService] Conflit de période détecté:', periodConflict);
      conflicts.push(periodConflict);
      return { isAvailable: false, conflicts };
    }

    try {
      if (!formula.rates || formula.rates.length === 0) {
        console.log('[AvailabilityService] Formule sans tarifs:', formula.id);
        return {
          isAvailable: true,
          conflicts: [],
          assignments: []
        };
      }

      // Calculer les ressources requises
      const requiredResources = formula.rates.flatMap(rate => 
        rate.resources.map(resource => ({
          resourceId: resource.resourceId,
          quantity: resource.quantity * participants
        }))
      );

      console.log('[AvailabilityService] Ressources requises:', requiredResources);

      // Regrouper les quantités
      const resourceQuantities = requiredResources.reduce((acc, curr) => {
        const existing = acc.find(r => r.resourceId === curr.resourceId);
        if (existing) {
          existing.quantity += curr.quantity;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      }, [] as Array<{ resourceId: string; quantity: number }>);

      console.log('[AvailabilityService] Quantités regroupées:', resourceQuantities);

      // Vérifier chaque ressource
      const resourcePromises = resourceQuantities.map(async resource => {
        const assignment = await this.findBestResourceAssignment(
          resource.resourceId,
          resource.quantity,
          date,
          startTime,
          endTime
        );
        console.log(`[AvailabilityService] Assignment pour ${resource.resourceId}:`, assignment);
        return assignment;
      });

      const resourceAssignments = await Promise.all(resourcePromises);
      const flatAssignments = resourceAssignments.flat();

      if (flatAssignments.length < resourceQuantities.length) {
        console.log('[AvailabilityService] Ressources insuffisantes:', {
          required: resourceQuantities.length,
          found: flatAssignments.length
        });
        conflicts.push({
          type: 'RESOURCE',
          message: 'Ressources insuffisantes pour ce créneau'
        });
        return { isAvailable: false, conflicts };
      }

      console.log('[AvailabilityService] Disponibilité confirmée:', {
        assignments: flatAssignments
      });

      return {
        isAvailable: true,
        conflicts: [],
        assignments: flatAssignments
      };

    } catch (error) {
      console.error('[AvailabilityService] Erreur:', error);
      conflicts.push({
        type: 'RESOURCE',
        message: error instanceof Error ? error.message : 'L\'allocation des ressources a échoué'
      });
      return { isAvailable: false, conflicts };
    }
  }

  async createReservation(reservationData: ReservationData): Promise<Reservation> {
    const { activity, formula, date, startTime, participants } = reservationData;
    
    // Calculer la durée en fonction de la formule
    const endTime = this.calculateEndTime(startTime, formula.duration);

    // Vérifier la disponibilité
    const availability = await this.checkActivityAvailability(
      activity,
      formula,
      date,
      startTime,
      endTime,
      participants
    );

    if (!availability.isAvailable) {
      throw new Error('Créneau non disponible : ' + availability.conflicts.map(c => c.message).join(', '));
    }

    // Créer la réservation avec les ressources de la formule
    const requiredResources = formula.rates.flatMap(rate => 
      rate.resources.map(resource => ({
        resourceId: resource.resourceId,
        quantity: resource.quantity * participants
      }))
    );

    // Regrouper les quantités par ressource
    const groupedResources = requiredResources.reduce((acc, curr) => {
      const existing = acc.find(r => r.resourceId === curr.resourceId);
      if (existing) {
        existing.quantity += curr.quantity;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, [] as Array<{ resourceId: string; quantity: number }>);

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      activityId: activity.id,
      formulaId: formula.id,
      date,
      startTime,
      endTime,
      participants,
      resources: groupedResources
    };

    this.reservations.push(reservation);
    return reservation;
  }

  async findBestResourceAssignment(
    resourceId: string,
    quantity: number,
    _date: Date,
    startTime: string,
    endTime: string
  ): Promise<ResourceAssignment[]> {
    const resource = await this.getResource(resourceId);
    if (!resource) return [];

    const maxAssignable = Math.min(quantity, resource.totalQuantity || 0);
    if (maxAssignable <= 0) return [];

    return [{
      resourceId,
      quantity: maxAssignable,
      startTime,
      endTime
    }];
  }

  async checkPeriodConflicts(date: Date, periods: Period[]): Promise<Conflict | null> {
    console.log('Vérification des périodes pour la date:', date);
    console.log('Périodes disponibles:', JSON.stringify(periods, null, 2));

    // S'assurer que les périodes ont des dates valides
    const validPeriods = periods.map(period => {
      console.log('Période avant conversion:', period);
      const convertedPeriod = {
        ...period,
        startDate: period.startDate instanceof Date ? period.startDate : new Date(period.startDate),
        endDate: period.endDate instanceof Date ? period.endDate : new Date(period.endDate),
        isActive: period.isActive !== false // true par défaut sauf si explicitement false
      };
      console.log('Période après conversion:', convertedPeriod);
      return convertedPeriod;
    });

    const activePeriod = validPeriods.find(period => {
      console.log('Vérification période:', period);
      console.log('Est active?', period.isActive);
      const isInPeriod = this.isDateInPeriod(date, period);
      console.log('Est dans la période?', isInPeriod);

      // Vérifier le planning pour ce jour
      if (period.schedule && Array.isArray(period.schedule)) {
        const dayOfWeek = date.getDay() + 1; // getDay() retourne 0-6, notre schedule utilise 1-7
        console.log('Jour de la semaine:', dayOfWeek);
        const daySchedule = period.schedule.find(s => s.dayOfWeek === dayOfWeek);
        console.log('Planning du jour:', daySchedule);
        
        if (!daySchedule?.isActive) {
          console.log('Ce jour n\'est pas actif dans le planning');
          return false;
        }
      }

      return period.isActive && isInPeriod;
    });

    if (!activePeriod) {
      return {
        type: 'PERIOD',
        message: 'Aucune période active trouvée pour cette date'
      };
    }

    return null;
  }

  async getAvailableTimeSlots(
    activity: Activity,
    formula: Formula,
    date: Date
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const dayOfWeek = date.getDay();
    const daySchedule = DEFAULT_WEEK_SCHEDULE[this.getDayName(dayOfWeek)];

    if (!daySchedule || !daySchedule.isActive) {
      return slots;
    }

    // Pour les formules journée (8h), on ne propose que le créneau de 10h à 18h
    if (formula.duration === 480) { // 8h = 480 minutes
      const availabilityCheck = await this.checkActivityAvailability(
        activity,
        formula,
        date,
        '10:00',
        '18:00',
        1
      );

      if (availabilityCheck.isAvailable) {
        slots.push({
          startTime: '10:00',
          endTime: '18:00'
        });
      }
      return slots;
    }

    let currentTime = daySchedule.openingTime;
    const closingTime = daySchedule.closingTime;

    while (currentTime < closingTime) {
      const endTime = this.calculateEndTime(currentTime, formula.duration);
      
      // Vérifier si le créneau dépasse l'heure de fermeture
      if (endTime > closingTime) {
        break;
      }

      // Vérifier si le créneau chevauche la pause déjeuner
      if (daySchedule.breakStartTime && daySchedule.breakEndTime) {
        if (currentTime < daySchedule.breakEndTime && endTime > daySchedule.breakStartTime) {
          currentTime = daySchedule.breakEndTime;
          continue;
        }
      }

      // Vérifier si le créneau est disponible
      const availabilityCheck = await this.checkActivityAvailability(
        activity,
        formula,
        date,
        currentTime,
        endTime,
        1
      );

      if (availabilityCheck.isAvailable) {
        slots.push({
          startTime: currentTime,
          endTime
        });
      }

      currentTime = this.calculateEndTime(currentTime, 30); // Intervalle de 30 minutes
    }

    return slots;
  }

  async getAvailableFormulas(activity: Activity): Promise<Formula[]> {
    return activity.formulas.filter(formula => formula.isActive);
  }

  async cancelReservation(reservationId: string): Promise<void> {
    const index = this.reservations.findIndex(r => r.id === reservationId);
    if (index !== -1) {
      this.reservations.splice(index, 1);
    }
  }

  clearReservations(): void {
    this.reservations = [];
    this.resourceCache.clear();
  }

  async getRemainingAvailability(
    resourceId: string,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<number> {
    const resource = await this.getResource(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }

    // Vérifier d'abord la disponibilité de la période
    const periodConflicts = await this.checkPeriodConflicts(date, this.periods);
    if (periodConflicts) {
      return 0;
    }

    // Récupérer toutes les réservations qui se chevauchent
    const overlappingReservations = this.reservations.filter(r => {
      const reservationDate = new Date(r.date);
      return (
        reservationDate.toDateString() === date.toDateString() &&
        this.isTimeOverlap(startTime, endTime, r.startTime, r.endTime)
      );
    });

    // Créer un tableau de tous les créneaux horaires réservés pour chaque ressource
    const reservedSlots: ResourceTimeSlot[] = [];
    overlappingReservations.forEach(reservation => {
      const resourceReservation = reservation.resources.find(r => r.resourceId === resourceId);
      if (resourceReservation) {
        for (let i = 0; i < resourceReservation.quantity; i++) {
          reservedSlots.push({
            resourceId: resourceId,
            startTime: reservation.startTime,
            endTime: reservation.endTime
          });
        }
      }
    });

    // Trouver le nombre de ressources disponibles en continu sur toute la période
    let availableCount = 0;
    for (let i = 0; i < resource.totalQuantity; i++) {
      // Vérifier si cette ressource est libre sur toute la période
      const isAvailable = !reservedSlots.some(slot =>
        this.isTimeOverlap(startTime, endTime, slot.startTime, slot.endTime)
      );
      
      if (isAvailable) {
        availableCount++;
      }
    }

    return availableCount;
  }

  async findAvailableTimeSlots(
    activity: Activity,
    date: Date,
    quantity: number
  ): Promise<AvailabilitySlot[]> {
    const availableSlots: AvailabilitySlot[] = [];
    const schedule = DEFAULT_WEEK_SCHEDULE[this.getDayName(date.getDay())];

    if (!schedule.isActive) {
      return [];
    }

    // Générer des créneaux de 30 minutes
    const startHour = parseInt(schedule.openingTime.split(':')[0]);
    const startMinute = parseInt(schedule.openingTime.split(':')[1]);
    const endHour = parseInt(schedule.closingTime.split(':')[0]);
    const endMinute = parseInt(schedule.closingTime.split(':')[1]);

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    const step = 30; // minutes

    for (let time = startTime; time < endTime; time += step) {
      const currentStartTime = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
      
      // Pour chaque durée de formule disponible
      for (const formula of activity.formulas) {
        const duration = formula.duration;
        const currentEndTime = this.calculateEndTime(currentStartTime, duration);
        
        // Vérifier si le créneau dépasse l'heure de fermeture
        const [endHourStr, endMinStr] = currentEndTime.split(':');
        const slotEndTime = parseInt(endHourStr) * 60 + parseInt(endMinStr);
        if (slotEndTime > endTime) {
          continue;
        }

        // Vérifier la pause déjeuner
        if (schedule.breakStartTime && schedule.breakEndTime) {
          const breakStart = this.timeToMinutes(schedule.breakStartTime);
          const breakEnd = this.timeToMinutes(schedule.breakEndTime);
          if (
            (time >= breakStart && time < breakEnd) ||
            (slotEndTime > breakStart && slotEndTime <= breakEnd) ||
            (time <= breakStart && slotEndTime >= breakEnd)
          ) {
            continue;
          }
        }

        // Vérifier la disponibilité des ressources
        let minAvailable = Infinity;
        for (const resource of activity.resources) {
          const available = await this.getRemainingAvailability(
            resource.resourceId,
            date,
            currentStartTime,
            currentEndTime
          );
          const resourceAvailable = Math.floor(available / resource.quantity);
          minAvailable = Math.min(minAvailable, resourceAvailable);
        }

        if (minAvailable > 0) {
          availableSlots.push({
            startTime: currentStartTime,
            endTime: currentEndTime,
            availableQuantity: minAvailable
          });
        }
      }
    }

    return availableSlots;
  }

  async getAvailableCapacity(
    resourceId: string,
    _quantity: number,
    date: Date,
    startTime: string,
    endTime: string
  ): Promise<number> {
    const resource = await this.getResource(resourceId);
    if (!resource) {
      return 0;
    }

    // Vérifier d'abord la disponibilité de la période
    const periodConflicts = await this.checkPeriodConflicts(date, this.periods);
    if (periodConflicts) {
      return 0;
    }

    // Récupérer toutes les réservations qui se chevauchent
    const overlappingReservations = this.reservations.filter(r => {
      const reservationDate = new Date(r.date);
      return (
        reservationDate.toDateString() === date.toDateString() &&
        this.isTimeOverlap(startTime, endTime, r.startTime, r.endTime)
      );
    });

    // Calculer la capacité totale utilisée
    const usedCapacity = overlappingReservations.reduce((total, reservation) => {
      const resourceReservation = reservation.resources.find(r => r.resourceId === resourceId);
      return total + (resourceReservation?.quantity || 0);
    }, 0);

    return Math.max(0, (resource.totalQuantity || 0) - usedCapacity);
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  private isTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const [start1Hour, start1Min] = start1.split(':').map(Number);
    const [end1Hour, end1Min] = end1.split(':').map(Number);
    const [start2Hour, start2Min] = start2.split(':').map(Number);
    const [end2Hour, end2Min] = end2.split(':').map(Number);

    const start1Time = start1Hour * 60 + start1Min;
    const end1Time = end1Hour * 60 + end1Min;
    const start2Time = start2Hour * 60 + start2Min;
    const end2Time = end2Hour * 60 + end2Min;

    return (
      (start1Time >= start2Time && start1Time < end2Time) ||
      (end1Time > start2Time && end1Time <= end2Time) ||
      (start2Time >= start1Time && start2Time < end1Time) ||
      (start1Time <= start2Time && end1Time >= end2Time)
    );
  }

  private getDayName(dayOfWeek: number): keyof WeekSchedule {
    const days: Record<number, keyof WeekSchedule> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };
    return days[dayOfWeek];
  }

  async getResource(resourceId: string): Promise<Resource | null> {
    return {
      id: resourceId,
      name: 'Test Resource',
      description: 'Test Description',
      totalQuantity: 10,
      capacity: 1,
      isActive: true,
      availability: []
    };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private isDateInPeriod(date: Date, period: Period): boolean {
    // S'assurer que les dates sont des objets Date
    const periodStartDate = period.startDate instanceof Date ? period.startDate : new Date(period.startDate);
    const periodEndDate = period.endDate instanceof Date ? period.endDate : new Date(period.endDate);
    
    // Normaliser les dates pour comparer uniquement les jours
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedStartDate = new Date(periodStartDate.getFullYear(), periodStartDate.getMonth(), periodStartDate.getDate());
    const normalizedEndDate = new Date(periodEndDate.getFullYear(), periodEndDate.getMonth(), periodEndDate.getDate());
    
    console.log('Dates normalisées:');
    console.log('Date à vérifier:', normalizedDate.toISOString());
    console.log('Date de début:', normalizedStartDate.toISOString());
    console.log('Date de fin:', normalizedEndDate.toISOString());
    
    const isInPeriod = normalizedDate >= normalizedStartDate && normalizedDate <= normalizedEndDate;
    console.log('Est dans la période?', isInPeriod);
    
    return isInPeriod;
  }
}

const availabilityService = new AvailabilityService();
export default availabilityService;

const DEFAULT_WEEK_SCHEDULE: WeekSchedule = {
  monday: { openingTime: '09:00', closingTime: '18:00', isActive: true },
  tuesday: { openingTime: '09:00', closingTime: '18:00', isActive: true },
  wednesday: { openingTime: '09:00', closingTime: '18:00', isActive: false },
  thursday: { openingTime: '14:00', closingTime: '18:00', isActive: true },
  friday: { openingTime: '09:00', closingTime: '18:00', isActive: true, breakStartTime: '12:00', breakEndTime: '14:00' },
  saturday: { openingTime: '09:00', closingTime: '18:00', isActive: true },
  sunday: { openingTime: '09:00', closingTime: '18:00', isActive: false }
};
