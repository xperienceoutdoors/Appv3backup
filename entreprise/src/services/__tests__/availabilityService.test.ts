import { availabilityService } from '../availabilityService';
import periodService from '../periodService';
import resourceService from '../resourceService';
import formulaService from '../formulaService';
import { Activity, ActivityDuration, ActivityPricing } from '../../types/business/Activity';
import { Period } from '../../types/business/Period';
import { Resource } from '../../types/business/Resource';
import { Formula, Rate, TimeSlot } from '../../types/business/Formula';

// Mock des services
jest.mock('../periodService');
jest.mock('../resourceService');
jest.mock('../formulaService');

describe('AvailabilityService', () => {
  // Données de test
  const mockActivity: Activity = {
    id: 'activity1',
    name: 'Test Activity',
    description: 'Test Description',
    process: 'Test Process',
    goodToKnow: 'Test Good to Know',
    included: 'Test Included',
    shortDescription: 'Test Short Description',
    duration: {
      duration: 60,
      setupTime: 10,
      cleanupTime: 10
    } as ActivityDuration,
    pricing: {
      basePrice: 100,
      childPrice: 80,
      groupPrice: 90,
      minParticipants: 4
    } as ActivityPricing,
    resources: [],
    maxParticipants: 10,
    minParticipants: 1,
    isActive: true,
    isOnline: false,
    categoryId: 'category1',
    categories: ['category1'],
    paymentSettings: {
      allowedMethods: [],
      depositPercentage: 30
    }
  };

  const mockPeriod: Period = {
    id: 'period1',
    name: 'Test Period',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-12-31'),
    activities: ['activity1'],
    schedule: [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
      // ... autres jours
    ],
    isOffPeak: false,
    daysOfWeek: [1, 2, 3, 4, 5],
    openingTime: '09:00',
    closingTime: '17:00',
  };

  const mockResource: Resource = {
    id: 'resource1',
    name: 'Test Resource',
    description: 'Test Resource Description',
    type: 'equipment',
    unit: 'piece',
    totalQuantity: 5,
    quantity: 5,
    capacity: 2,
    minQuantity: 1,
    isActive: true,
  };

  const mockTimeSlots: TimeSlot[] = [
    { time: '09:00' },
    { time: '10:00' },
    { time: '11:00' },
  ];

  const mockRates: Rate[] = [
    {
      id: 'rate1',
      name: 'Standard',
      price: 100,
      vat: 20,
    }
  ];

  const mockFormula: Formula = {
    id: 'formula1',
    activityId: 'activity1',
    name: 'Test Formula',
    duration: 60,
    timeSlots: mockTimeSlots,
    rates: mockRates,
    isActive: true,
  };

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
    
    // Configuration des mocks
    (periodService.getAll as jest.Mock).mockResolvedValue([mockPeriod]);
    (resourceService.getAll as jest.Mock).mockResolvedValue([mockResource]);
    (formulaService.getAll as jest.Mock).mockResolvedValue([mockFormula]);
  });

  describe('checkActivityAvailability', () => {
    it('devrait retourner disponible pour une activité valide pendant les heures d\'ouverture', async () => {
      const date = new Date('2025-02-03T10:00:00'); // Un lundi à 10h
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        2 // Nombre de participants
      );

      expect(result.isAvailable).toBe(true);
      expect(result.conflicts).toBeUndefined();
    });

    it('devrait retourner non disponible pour une activité inactive', async () => {
      const inactiveActivity = { ...mockActivity, isActive: false };
      const date = new Date('2025-02-03T10:00:00');
      const result = await availabilityService.checkActivityAvailability(
        inactiveActivity,
        date,
        2 // Nombre de participants
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts![0].type).toBe('activity');
    });

    it('devrait retourner non disponible en dehors des heures d\'ouverture', async () => {
      const date = new Date('2025-02-03T20:00:00'); // 20h (après la fermeture)
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        2 // Nombre de participants
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts!.some(c => c.type === 'period')).toBe(true);
    });
  });

  describe('getAvailableSlots', () => {
    it('devrait retourner les créneaux disponibles pour une date valide', async () => {
      const date = new Date('2025-02-03'); // Un lundi
      const slots = await availabilityService.getAvailableSlots(
        mockActivity,
        date
      );

      expect(slots).toBeInstanceOf(Array);
      expect(slots.length).toBeGreaterThan(0);
      slots.forEach(slot => {
        expect(slot).toHaveProperty('startTime');
        expect(slot).toHaveProperty('endTime');
        expect(slot).toHaveProperty('formula');
        expect(slot).toHaveProperty('remainingSpots');
        expect(slot).toHaveProperty('price');
      });
    });

    it('devrait retourner une liste vide pour une date hors période', async () => {
      const date = new Date('2026-01-01'); // Hors période
      const slots = await availabilityService.getAvailableSlots(
        mockActivity,
        date
      );

      expect(slots).toHaveLength(0);
    });
  });

  describe('findBestResourceAssignment', () => {
    it('devrait assigner correctement les ressources continues disponibles', async () => {
      const date = new Date('2025-02-03');
      const assignments = await availabilityService.findBestResourceAssignment(
        'resource1',
        2,
        date,
        '10:00',
        '12:00'
      );

      expect(assignments).toHaveLength(2);
      expect(assignments[0].resourceId).toBe('resource1_1');
      expect(assignments[1].resourceId).toBe('resource1_2');
      assignments.forEach(assignment => {
        expect(assignment.startTime).toBe('10:00');
        expect(assignment.endTime).toBe('12:00');
        expect(assignment.quantity).toBe(1);
      });
    });

    it('devrait échouer si pas assez de ressources continues disponibles', async () => {
      const date = new Date('2025-02-03');
      // Simuler des réservations existantes
      availabilityService['reservations'] = [
        {
          id: 'res1',
          date: date,
          startTime: '09:00',
          endTime: '13:00',
          resources: [{ resourceId: 'resource1', quantity: 4 }]
        }
      ];

      await expect(
        availabilityService.findBestResourceAssignment(
          'resource1',
          3,
          date,
          '10:00',
          '12:00'
        )
      ).rejects.toThrow('Not enough continuous resources available');
    });

    it('devrait gérer correctement les réservations qui se chevauchent', async () => {
      const date = new Date('2025-02-03');
      // Simuler des réservations qui se chevauchent
      availabilityService['reservations'] = [
        {
          id: 'res1',
          date: date,
          startTime: '09:00',
          endTime: '11:00',
          resources: [{ resourceId: 'resource1', quantity: 2 }]
        },
        {
          id: 'res2',
          date: date,
          startTime: '11:00',
          endTime: '13:00',
          resources: [{ resourceId: 'resource1', quantity: 2 }]
        }
      ];

      const assignments = await availabilityService.findBestResourceAssignment(
        'resource1',
        3,
        date,
        '10:00',
        '12:00'
      );

      expect(assignments).toHaveLength(3);
      // Vérifie que les ressources assignées sont différentes des ressources réservées
      const assignedIds = assignments.map(a => a.resourceId);
      expect(assignedIds).toContain('resource1_3');
      expect(assignedIds).toContain('resource1_4');
      expect(assignedIds).toContain('resource1_5');
    });
  });

  describe('checkActivityAvailability avec ressources continues', () => {
    beforeEach(() => {
      // Reset des réservations
      availabilityService['reservations'] = [];
      
      // Configuration de l'activité avec des ressources
      mockActivity.resources = [
        { resourceId: 'resource1', quantity: 2 }, // Besoin de 2 kayaks par réservation
        { resourceId: 'resource2', quantity: 1 }  // Besoin de 1 pagaie par réservation
      ];
    });

    it('devrait valider une réservation quand les ressources sont disponibles en continu', async () => {
      const date = new Date('2025-02-03'); // Lundi
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        '10:00',
        '12:00',
        1 // Pour une personne
      );

      expect(result.isAvailable).toBe(true);
      expect(result.assignments).toBeDefined();
      expect(result.assignments).toHaveLength(3); // 2 kayaks + 1 pagaie
    });

    it('devrait refuser une réservation quand les ressources ne sont pas disponibles en continu', async () => {
      const date = new Date('2025-02-03');
      // Simuler des réservations existantes qui fragmentent la disponibilité
      availabilityService['reservations'] = [
        {
          id: 'res1',
          date: date,
          startTime: '09:00',
          endTime: '11:00',
          resources: [{ resourceId: 'resource1', quantity: 3 }]
        },
        {
          id: 'res2',
          date: date,
          startTime: '11:00',
          endTime: '13:00',
          resources: [{ resourceId: 'resource1', quantity: 3 }]
        }
      ];

      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        '10:00',
        '12:00',
        1
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts![0].type).toBe('resource');
    });

    it('devrait gérer correctement les réservations multiples sur la même période', async () => {
      const date = new Date('2025-02-03');
      
      // Première réservation
      const result1 = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        '10:00',
        '12:00',
        1
      );
      expect(result1.isAvailable).toBe(true);

      // Simuler l'enregistrement de la première réservation
      if (result1.assignments) {
        availabilityService['reservations'].push({
          id: 'res1',
          date: date,
          startTime: '10:00',
          endTime: '12:00',
          resources: result1.assignments.map(a => ({
            resourceId: a.resourceId.split('_')[0],
            quantity: 1
          }))
        });
      }

      // Deuxième réservation sur la même période
      const result2 = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        '10:00',
        '12:00',
        1
      );
      expect(result2.isAvailable).toBe(true);

      // Les ressources assignées devraient être différentes
      const firstAssignments = result1.assignments!.map(a => a.resourceId);
      const secondAssignments = result2.assignments!.map(a => a.resourceId);
      expect(firstAssignments).not.toEqual(expect.arrayContaining(secondAssignments));
    });

    it('devrait gérer correctement les réservations qui se chevauchent partiellement', async () => {
      const date = new Date('2025-02-03');
      
      // Réservation existante de 10h à 12h
      availabilityService['reservations'] = [{
        id: 'res1',
        date: date,
        startTime: '10:00',
        endTime: '12:00',
        resources: [
          { resourceId: 'resource1', quantity: 2 },
          { resourceId: 'resource2', quantity: 1 }
        ]
      }];

      // Tentative de réservation qui chevauche (11h à 13h)
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        date,
        '11:00',
        '13:00',
        1
      );

      expect(result.isAvailable).toBe(true);
      expect(result.assignments).toBeDefined();
      // Vérifie que les ressources assignées sont différentes
      const assignedIds = result.assignments!.map(a => a.resourceId);
      expect(assignedIds).not.toContain('resource1_1');
      expect(assignedIds).not.toContain('resource1_2');
    });
  });

  describe('checkActivityAvailability avec formules', () => {
    const mockFormulaWithResources: Formula = {
      ...mockFormula,
      rates: [{
        ...mockRates[0],
        resources: [{
          resourceId: 'resource1',
          quantity: 2
        }]
      }]
    };

    it('devrait vérifier correctement la disponibilité des ressources de la formule', async () => {
      const date = new Date('2025-02-03T10:00:00');
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        mockFormulaWithResources,
        date,
        '10:00',
        '11:00',
        2 // participants
      );

      expect(result.isAvailable).toBe(true);
      expect(result.assignments).toHaveLength(1);
      expect(result.assignments![0].quantity).toBe(4); // 2 (quantité) * 2 (participants)
    });

    it('devrait gérer correctement les ressources multiples dans différents tarifs', async () => {
      const formulaWithMultipleRates: Formula = {
        ...mockFormula,
        rates: [
          {
            ...mockRates[0],
            resources: [{
              resourceId: 'resource1',
              quantity: 1
            }]
          },
          {
            ...mockRates[0],
            id: 'rate2',
            resources: [{
              resourceId: 'resource1',
              quantity: 1
            }]
          }
        ]
      };

      const date = new Date('2025-02-03T10:00:00');
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        formulaWithMultipleRates,
        date,
        '10:00',
        '11:00',
        2 // participants
      );

      expect(result.isAvailable).toBe(true);
      expect(result.assignments).toHaveLength(1);
      expect(result.assignments![0].quantity).toBe(4); // (1+1) * 2 participants
    });

    it('devrait retourner non disponible si les ressources sont insuffisantes', async () => {
      const resourceWithLowQuantity: Resource = {
        ...mockResource,
        totalQuantity: 2
      };
      (resourceService.getAll as jest.Mock).mockResolvedValue([resourceWithLowQuantity]);

      const date = new Date('2025-02-03T10:00:00');
      const result = await availabilityService.checkActivityAvailability(
        mockActivity,
        mockFormulaWithResources,
        date,
        '10:00',
        '11:00',
        2 // participants nécessitant 4 ressources au total
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts![0].type).toBe('RESOURCE');
    });
  });

  describe('createReservation avec formules', () => {
    it('devrait créer une réservation avec les bonnes quantités de ressources', async () => {
      const formula: Formula = {
        ...mockFormula,
        rates: [{
          ...mockRates[0],
          resources: [{
            resourceId: 'resource1',
            quantity: 2
          }]
        }]
      };

      const reservationData = {
        activity: mockActivity,
        formula,
        date: new Date('2025-02-03'),
        startTime: '10:00',
        participants: 2
      };

      const reservation = await availabilityService.createReservation(reservationData);

      expect(reservation).toBeDefined();
      expect(reservation.resources).toHaveLength(1);
      expect(reservation.resources[0].quantity).toBe(4); // 2 (quantité) * 2 (participants)
    });

    it('devrait rejeter la réservation si les ressources ne sont pas disponibles', async () => {
      const resourceWithLowQuantity: Resource = {
        ...mockResource,
        totalQuantity: 2
      };
      (resourceService.getAll as jest.Mock).mockResolvedValue([resourceWithLowQuantity]);

      const formula: Formula = {
        ...mockFormula,
        rates: [{
          ...mockRates[0],
          resources: [{
            resourceId: 'resource1',
            quantity: 2
          }]
        }]
      };

      const reservationData = {
        activity: mockActivity,
        formula,
        date: new Date('2025-02-03'),
        startTime: '10:00',
        participants: 2
      };

      await expect(availabilityService.createReservation(reservationData))
        .rejects
        .toThrow('Créneau non disponible');
    });
  });
});
