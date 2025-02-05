import { describe, it, expect, beforeEach } from 'vitest';
import { realTimeAvailabilityService } from '../services/realTimeAvailabilityService';
import { Activity, Formula } from '../types/business/Activity';
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
    createdAt: new Date(),
    updatedAt: new Date()
  }],
  
  resources: [{
    id: 'kayak-double',
    name: 'Kayak Double',
    description: 'Kayak 2 places stable et confortable',
    totalQuantity: 5,
    isActive: true
  }],
  
  periods: [{
    id: 'period-mars-2025',
    name: 'Mars 2025',
    description: 'Période de test mars 2025',
    startDate: '2025-03-01',
    endDate: '2025-03-31',
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

describe('Tests de réservation', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
    localStorage.setItem('activities', JSON.stringify(testData.activities));
    localStorage.setItem('resources', JSON.stringify(testData.resources));
    localStorage.setItem('periods', JSON.stringify(testData.periods));
    localStorage.setItem('reservations', JSON.stringify([]));
  });

  describe('Test 1: Réservation standard et mise à jour des disponibilités', () => {
    it('devrait permettre une réservation de 2 kayaks et mettre à jour les disponibilités', async () => {
      // 1. Vérifier l'état initial
      const initialAvailability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(initialAvailability.isAvailable).toBe(true);
      expect(initialAvailability.availableQuantity).toBe(5);

      // 2. Créer une réservation de 2 kayaks
      const reservation = {
        id: 'test-reservation-1',
        activityId: 'kayak-activity',
        date: '2025-03-01',
        startTime: '10:00',
        endTime: '14:00',
        quantity: 2,
        status: 'confirmed'
      };

      const reservations = [reservation];
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
      expect(finalAvailability.availableQuantity).toBe(3);
    });

    it('devrait refuser une réservation de 5 kayaks quand seulement 3 sont disponibles', async () => {
      // 1. Créer une réservation initiale de 2 kayaks
      const initialReservation = {
        id: 'test-reservation-1',
        activityId: 'kayak-activity',
        date: '2025-03-01',
        startTime: '10:00',
        endTime: '14:00',
        quantity: 2,
        status: 'confirmed'
      };

      const reservations = [initialReservation];
      localStorage.setItem('reservations', JSON.stringify(reservations));

      // 2. Tenter une réservation de 5 kayaks
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods,
        quantity: 5
      });

      expect(availability.isAvailable).toBe(false);
      expect(availability.conflicts).toBeDefined();
      expect(availability.conflicts?.some(c => c.type === 'RESOURCE')).toBe(true);
    });
  });

  describe('Test 2: Essayer de réserver une quantité trop importante', () => {
    it('devrait accepter une réservation de 3 kayaks quand 4 sont disponibles', async () => {
      // 1. Créer une réservation initiale de 1 kayak
      const initialReservation = {
        id: 'test-reservation-1',
        activityId: 'kayak-activity',
        date: '2025-03-01',
        startTime: '10:00',
        endTime: '14:00',
        quantity: 1,
        status: 'confirmed'
      };

      const reservations = [initialReservation];
      localStorage.setItem('reservations', JSON.stringify(reservations));

      // 2. Tenter une réservation de 3 kayaks
      const availability = await realTimeAvailabilityService.getAvailability({
        activity: testData.activities[0],
        date: new Date('2025-03-01'),
        startTime: '10:00',
        endTime: '14:00',
        periods: testData.periods
      });

      expect(availability.isAvailable).toBe(true);
      expect(availability.availableQuantity).toBe(4);
    });
  });
});
