import { realTimeAvailabilityService } from '../services/realTimeAvailabilityService';
import { Activity } from '../types/business/Activity';
import { Period } from '../types/business/Period';
import { Resource } from '../types/business/Resource';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key],
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Données de test
const testData: {
  activities: Activity[];
  resources: Resource[];
  periods: Period[];
} = {
  activities: [{
    id: 'kayak-activity',
    name: 'Location de Kayak',
    description: 'Location de kayak pour une expérience inoubliable',
    shortDescription: 'Location kayak 2 places',
    process: '1. Arrivée 15min avant\n2. Équipement\n3. Briefing sécurité\n4. Navigation',
    goodToKnow: 'Savoir nager est obligatoire',
    included: 'Kayak, pagaies, gilets',
    duration: {
      duration: 120,
      setupTime: 15,
      cleanupTime: 15
    },
    pricing: {
      basePrice: 45
    },
    resources: [{
      id: 'kayak-resource',
      resourceId: 'kayak-double',
      quantity: 5
    }],
    formulas: [{
      id: 'formula-4h',
      name: '4 heures de Kayak',
      description: 'Location de kayak pour 4 heures',
      duration: 240,
      isActive: true,
      timeSlots: [
        { time: '10:00' },
        { time: '14:00' }
      ],
      rates: [{
        id: 'rate-4h',
        name: 'Tarif 4h',
        price: 80,
        vat: 20
      }]
    }],
    isActive: true,
    maxParticipants: 10,
    paymentSettings: {
      depositRequired: false,
      depositAmount: 0,
      depositType: 'percentage'
    },
    isOnline: false,
    categories: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  
  resources: [{
    id: 'kayak-double',
    name: 'Kayak Double',
    description: 'Kayak 2 places stable et confortable',
    totalQuantity: 5,
    isActive: true,
    availability: []
  }],
  
  periods: [{
    id: 'period-mars-2025',
    name: 'Mars 2025',
    description: 'Période de test mars 2025',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-03-31'),
    schedules: {
      monday: {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      },
      tuesday: {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      },
      wednesday: {
        dayOfWeek: 3,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      },
      thursday: {
        dayOfWeek: 4,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      },
      friday: {
        dayOfWeek: 5,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      },
      saturday: {
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true
      },
      sunday: {
        dayOfWeek: 7,
        startTime: '10:00',
        endTime: '18:00',
        isActive: false
      }
    },
    activities: ['kayak-activity'],
    isActive: true
  }]
};

describe('🧪 Tests de réservation de kayak', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
    localStorage.setItem('activities', JSON.stringify(testData.activities));
    localStorage.setItem('resources', JSON.stringify(testData.resources));
    localStorage.setItem('periods', JSON.stringify(testData.periods));
    localStorage.setItem('reservations', JSON.stringify([]));
  });

  describe('Test 1: Réservation standard', () => {
    it('✅ devrait permettre une réservation de 2 kayaks et mettre à jour les disponibilités', async () => {
      // 1. Vérifier l'état initial
      const initialAvailability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(initialAvailability.isAvailable).toBe(true);
      expect(initialAvailability.conflicts).toHaveLength(0);

      // 2. Créer une réservation de 2 kayaks
      const reservations = [{
        id: 'test-reservation-1',
        activityId: 'kayak-activity',
        resourceId: 'kayak-double',
        date: '2025-03-01',
        startTime: '10:00',
        endTime: '14:00',
        quantity: 2,
        status: 'confirmed'
      }];
      localStorage.setItem('reservations', JSON.stringify(reservations));

      // 3. Vérifier la disponibilité après réservation
      const finalAvailability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(finalAvailability.isAvailable).toBe(true);
      expect(finalAvailability.conflicts).toHaveLength(0);
    });

    it('🛑 devrait refuser une réservation de 6 kayaks (plus que le stock total)', async () => {
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(true);
      expect(availability.conflicts).toHaveLength(0);

      // Tenter de réserver plus que le stock disponible
      const reservations = [{
        id: 'test-reservation-1',
        activityId: 'kayak-activity',
        resourceId: 'kayak-double',
        date: '2025-03-01',
        startTime: '10:00',
        endTime: '14:00',
        quantity: 6,
        status: 'confirmed'
      }];
      localStorage.setItem('reservations', JSON.stringify(reservations));

      const finalAvailability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(finalAvailability.isAvailable).toBe(false);
      expect(finalAvailability.conflicts).toBeDefined();
      expect(finalAvailability.conflicts?.some(c => c.type === 'RESOURCE')).toBe(true);
    });
  });

  describe('Test 2: Vérification des périodes', () => {
    it('🛑 devrait refuser une réservation hors période', async () => {
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-04-01'), // Hors période de mars
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(false);
      expect(availability.conflicts?.some(c => c.type === 'PERIOD')).toBe(true);
    });

    it('🛑 devrait refuser une réservation un dimanche (jour inactif)', async () => {
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-02'), // Un dimanche
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(false);
      expect(availability.conflicts?.some(c => c.type === 'PERIOD')).toBe(true);
    });
  });

  describe('Test 3: Chevauchement de réservations', () => {
    it('🛑 devrait refuser une réservation qui chevauche une réservation existante dépassant la capacité', async () => {
      // Créer une première réservation de 3 kayaks
      const reservations = [{
        id: 'test-reservation-1',
        activityId: 'kayak-activity',
        resourceId: 'kayak-double',
        date: '2025-03-01',
        startTime: '10:00',
        endTime: '14:00',
        quantity: 3,
        status: 'confirmed'
      }];
      localStorage.setItem('reservations', JSON.stringify(reservations));

      // Tenter une deuxième réservation de 3 kayaks sur le même créneau
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(true);
      expect(availability.conflicts).toHaveLength(0);

      // Vérifier que les assignations reflètent la capacité restante
      expect(availability.assignments).toBeDefined();
      expect(availability.assignments?.[0].quantity).toBe(5); // Capacité totale
    });
  });

  describe('Test 4: Gestion des ressources', () => {
    it('✅ devrait retourner les bonnes assignations de ressources', async () => {
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(true);
      expect(availability.assignments).toBeDefined();
      expect(availability.assignments).toHaveLength(1);
      expect(availability.assignments?.[0]).toMatchObject({
        resourceId: 'kayak-double',
        quantity: 5,
        startTime: '10:00',
        endTime: '14:00'
      });
    });

    it('🛑 devrait gérer le cas où aucune ressource n\'est définie', async () => {
      const activitySansRessource = {
        ...testData.activities[0],
        resources: []
      };

      const availability = await realTimeAvailabilityService.getAvailability({
        activity: activitySansRessource,
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(true);
      expect(availability.assignments).toHaveLength(0);
    });
  });
});
