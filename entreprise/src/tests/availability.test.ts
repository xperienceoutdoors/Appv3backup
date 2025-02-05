import { describe, it, expect, beforeEach } from '@jest/globals';
import availabilityService from '../services/availabilityService';
import { Activity } from '../types/business/Activity';
import { Formula } from '../types/business/Formula';
import { Resource } from '../types/business/Resource';
import { Period } from '../types/business/Period';

// Mock du service de période
const periodService = {
  getAll: jest.fn()
};

describe('Système de disponibilité', () => {
  // Configuration initiale
  const kayak: Resource = {
    id: 'kayak-1',
    name: 'Kayak 1 place',
    description: 'Kayak monoplace pour location',
    totalQuantity: 5,
    isActive: true,
    availability: []
  };

  // Configuration des formules
  const oneHourFormula: Formula = {
    id: 'kayak-1h',
    name: 'Location 1h',
    description: 'Location de kayak pour 1 heure',
    duration: 60,
    isActive: true,
    timeSlots: [{ time: '10:00' }],
    rates: [{
      id: 'rate-1h',
      name: 'Tarif standard 1h',
      price: 15,
      vat: 20
    }]
  };

  const twoHourFormula: Formula = {
    id: 'kayak-2h',
    name: 'Location 2h',
    description: 'Location de kayak pour 2 heures',
    duration: 120,
    isActive: true,
    timeSlots: [{ time: '10:00' }],
    rates: [{
      id: 'rate-1',
      name: 'Tarif standard',
      price: 25,
      vat: 20
    }]
  };

  const kayakActivity: Activity = {
    id: 'kayak-rental',
    name: 'Location de kayak',
    description: 'Location de kayak 1 place',
    shortDescription: 'Location kayak 1 place',
    process: 'Arrivez 15 minutes avant, équipement fourni',
    goodToKnow: 'Savoir nager est obligatoire',
    included: 'Kayak, pagaie, gilet',
    isActive: true,
    duration: {
      duration: 120,
      setupTime: 15,
      cleanupTime: 15
    },
    pricing: {
      basePrice: 25
    },
    resources: [{
      resourceId: kayak.id,
      quantity: 1
    }],
    maxParticipants: 5,
    isOnline: true,
    categories: [],
    formulas: [oneHourFormula, twoHourFormula],
    paymentSettings: {
      depositRequired: false,
      depositAmount: 0,
      depositType: 'none'
    }
  };

  // Période de test pour mars
  const marchPeriod: Period = {
    id: 'march-2024',
    name: 'Mars 2024',
    description: 'Période de mars 2024',
    startDate: new Date('2024-03-01T00:00:00.000Z'),
    endDate: new Date('2024-03-31T23:59:59.999Z'),
    schedules: {
      monday: { openingTime: '10:00', closingTime: '18:00' },
      tuesday: { openingTime: '10:00', closingTime: '18:00' },
      wednesday: { openingTime: '10:00', closingTime: '18:00' },
      thursday: { openingTime: '10:00', closingTime: '18:00' },
      friday: { openingTime: '10:00', closingTime: '18:00', breakStartTime: '12:30', breakEndTime: '13:30' },
      saturday: { openingTime: '10:00', closingTime: '18:00' },
      sunday: { openingTime: '10:00', closingTime: '18:00' }
    },
    activities: [kayakActivity.id],
    isActive: true
  };

  const march1st = new Date('2024-03-01T10:00:00.000Z');

  beforeEach(() => {
    // Réinitialiser l'état des réservations et des périodes avant chaque test
    jest.clearAllMocks();
    // Mock le service de période pour retourner notre période de test
    jest.spyOn(periodService, 'getAll').mockResolvedValue([marchPeriod]);
  });

  describe('Scénario 1 : Réservation standard avec mise à jour des disponibilités', () => {
    // Configuration initiale
    const kayak: Resource = {
      id: 'kayak-1',
      name: 'Kayak 1 place',
      description: 'Kayak monoplace pour location',
      totalQuantity: 5,
      isActive: true,
      availability: []
    };

    const twoHourFormula: Formula = {
      id: 'kayak-2h',
      name: 'Location 2h',
      description: 'Location de kayak pour 2 heures',
      duration: 120,
      isActive: true,
      timeSlots: [{ time: '10:00' }],
      rates: [{
        id: 'rate-1',
        name: 'Tarif standard',
        price: 25,
        vat: 20
      }]
    };

    const kayakActivity: Activity = {
      id: 'kayak-rental',
      name: 'Location de kayak',
      description: 'Location de kayak 1 place',
      shortDescription: 'Location kayak 1 place',
      process: 'Arrivez 15 minutes avant, équipement fourni',
      goodToKnow: 'Savoir nager est obligatoire',
      included: 'Kayak, pagaie, gilet',
      isActive: true,
      duration: {
        duration: 120,
        setupTime: 15,
        cleanupTime: 15
      },
      pricing: {
        basePrice: 25
      },
      resources: [{
        resourceId: kayak.id,
        quantity: 1
      }],
      maxParticipants: 5,
      isOnline: true,
      categories: [],
      formulas: [twoHourFormula],
      paymentSettings: {
        depositRequired: false,
        depositAmount: 0,
        depositType: 'none'
      }
    };

    const march1st = new Date('2024-03-01T10:00:00.000Z');

    beforeEach(() => {
      // Réinitialiser l'état des réservations avant chaque test
      jest.clearAllMocks();
    });

    it('devrait permettre une réservation de 3 kayaks quand 5 sont disponibles', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        march1st,
        '10:00',
        '12:00',
        3
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait mettre à jour les disponibilités après une réservation', async () => {
      // Simuler la première réservation de 3 kayaks
      await availabilityService.createReservation({
        activity: kayakActivity,
        date: march1st,
        startTime: '10:00',
        endTime: '12:00',
        participants: 3
      });

      // Vérifier les disponibilités mises à jour
      const remainingAvailability = await availabilityService.getRemainingAvailability(
        kayak.id,
        march1st,
        '10:00',
        '12:00'
      );

      expect(remainingAvailability).toBe(2); // 5 kayaks - 3 réservés = 2 disponibles
    });

    it('devrait refuser une réservation de 4 kayaks quand seulement 2 sont disponibles', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        march1st,
        '10:00',
        '12:00',
        4
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('resource');
    });
  });

  describe('Scénario 2 : Vérification des créneaux horaires selon les périodes', () => {
    it('ne devrait pas permettre une réservation avant l\'heure d\'ouverture', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        march1st,
        '09:00',
        '11:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('ne devrait pas permettre une réservation après l\'heure de fermeture', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        march1st,
        '17:00',
        '19:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('ne devrait pas permettre une réservation pendant la pause déjeuner le vendredi', async () => {
      const friday = new Date('2024-03-01'); // Premier vendredi de mars 2024
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        friday,
        '12:30',
        '14:30',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('devrait permettre une réservation pendant les heures d\'ouverture normales', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        march1st,
        '14:00',
        '16:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });
  });

  describe('Scénario 2 : Vérification des créneaux horaires proposés', () => {
    // Configuration des formules
    const oneHourFormula: Formula = {
      id: 'kayak-1h',
      name: 'Location 1h',
      description: 'Location de kayak pour 1 heure',
      duration: 60,
      isActive: true,
      timeSlots: [{ time: '10:00' }],
      rates: [{
        id: 'rate-1h',
        name: 'Tarif standard 1h',
        price: 15,
        vat: 20
      }]
    };

    const twoHourFormula: Formula = {
      id: 'kayak-2h',
      name: 'Location 2h',
      description: 'Location de kayak pour 2 heures',
      duration: 120,
      isActive: true,
      timeSlots: [{ time: '10:00' }],
      rates: [{
        id: 'rate-2h',
        name: 'Tarif standard 2h',
        price: 25,
        vat: 20
      }]
    };

    // Mise à jour de l'activité avec les formules disponibles
    const kayakActivityWithFormulas: Activity = {
      ...kayakActivity,
      formulas: [oneHourFormula, twoHourFormula],
      paymentSettings: {
        depositRequired: false,
        depositAmount: 0,
        depositType: 'none'
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      // Mock le service de période
      jest.spyOn(periodService, 'getAll').mockResolvedValue([marchPeriod]);
    });

    it('ne devrait pas permettre une réservation qui dépasse l\'heure de fermeture', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivityWithFormulas,
        march1st,
        '17:00',
        '19:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('ne devrait pas proposer de formule 3h car elle n\'existe pas', async () => {
      const availableFormulas = await availabilityService.getAvailableFormulas(kayakActivityWithFormulas);

      expect(availableFormulas).toHaveLength(2);
      expect(availableFormulas.map(f => f.duration)).toEqual([60, 120]);
      expect(availableFormulas.some(f => f.duration === 180)).toBe(false);
    });

    it('devrait accepter une réservation qui respecte les horaires d\'ouverture', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivityWithFormulas,
        march1st,
        '16:00',
        '18:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait générer uniquement des créneaux valides pour une formule donnée', async () => {
      const timeSlots = await availabilityService.getAvailableTimeSlots(
        kayakActivityWithFormulas,
        twoHourFormula,
        march1st
      );

      // Le dernier créneau possible pour 2h devrait être 16:00
      const lastSlot = timeSlots[timeSlots.length - 1];
      expect(lastSlot.startTime).toBe('16:00');
      
      // Vérifier qu'il n'y a pas de créneaux après 16:00
      expect(timeSlots.some(slot => slot.startTime > '16:00')).toBe(false);
    });
  });

  describe('Scénario 3 : Réservation avec formule journée (8h)', () => {
    // Ajout de la formule journée (8h)
    const fullDayFormula: Formula = {
      id: 'kayak-8h',
      name: 'Location journée',
      description: 'Location de kayak pour la journée',
      duration: 480, // 8 heures en minutes
      isActive: true,
      timeSlots: [{ time: '10:00' }], // Début à 10h pour finir à 18h
      rates: [{
        id: 'rate-day',
        name: 'Tarif journée',
        price: 50,
        vat: 20
      }]
    };

    // Mise à jour de l'activité avec toutes les formules
    const kayakActivityWithDayFormula: Activity = {
      ...kayakActivity,
      formulas: [oneHourFormula, twoHourFormula, fullDayFormula],
      paymentSettings: {
        depositRequired: false,
        depositAmount: 0,
        depositType: 'none'
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      // Réinitialiser l'état des réservations
      availabilityService.clearReservations();
    });

    it('devrait permettre une réservation journée de 3 kayaks quand 5 sont disponibles', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivityWithDayFormula,
        march1st,
        '10:00',
        '18:00',
        3
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait bloquer les kayaks pour toute la journée après une réservation journée', async () => {
      // Première réservation : 3 kayaks pour la journée
      await availabilityService.createReservation({
        activity: kayakActivityWithDayFormula,
        date: march1st,
        startTime: '10:00',
        endTime: '18:00',
        participants: 3
      });

      // Tentative de réserver 3 kayaks pour 2h pendant la journée
      const secondCheck = await availabilityService.checkActivityAvailability(
        kayakActivityWithDayFormula,
        march1st,
        '14:00',
        '16:00',
        3
      );

      expect(secondCheck.isAvailable).toBe(false);
      expect(secondCheck.conflicts).toBeDefined();
      expect(secondCheck.conflicts![0].type).toBe('resource');
    });

    it('devrait permettre une réservation de 2 kayaks même si 3 sont déjà pris pour la journée', async () => {
      // Première réservation : 3 kayaks pour la journée
      await availabilityService.createReservation({
        activity: kayakActivityWithDayFormula,
        date: march1st,
        startTime: '10:00',
        endTime: '18:00',
        participants: 3
      });

      // Tentative de réserver 2 kayaks pour 2h
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivityWithDayFormula,
        march1st,
        '14:00',
        '16:00',
        2
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait vérifier la disponibilité sur toute la durée de 8h', async () => {
      const timeSlots = await availabilityService.getAvailableTimeSlots(
        kayakActivityWithDayFormula,
        fullDayFormula,
        march1st
      );

      // Pour une formule de 8h, seul le créneau de 10h devrait être disponible
      expect(timeSlots).toHaveLength(1);
      expect(timeSlots[0].startTime).toBe('10:00');
      expect(timeSlots[0].endTime).toBe('18:00');
    });
  });

  describe('Scénario 3 : Adaptation aux changements d\'horaires', () => {
    // Créer une nouvelle période avec des horaires différents
    const updatedMarchPeriod: Period = {
      ...marchPeriod,
      schedules: {
        monday: { openingTime: '09:00', closingTime: '20:00' },
        tuesday: { openingTime: '09:00', closingTime: '20:00' },
        wednesday: { openingTime: '09:00', closingTime: '20:00', isActive: false },
        thursday: { openingTime: '14:00', closingTime: '20:00' },
        friday: { openingTime: '09:00', closingTime: '20:00', breakStartTime: '13:00', breakEndTime: '14:30' },
        saturday: { openingTime: '09:00', closingTime: '20:00' },
        sunday: { openingTime: '09:00', closingTime: '20:00' }
      }
    };

    beforeEach(() => {
      // Mock le service de période pour retourner la période mise à jour
      jest.spyOn(periodService, 'getAll').mockResolvedValue([updatedMarchPeriod]);
    });

    it('devrait permettre une réservation à 9h avec les nouveaux horaires', async () => {
      const monday = new Date('2024-03-04'); // Premier lundi de mars 2024
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        monday,
        '09:00',
        '11:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait permettre une réservation jusqu\'à 18h avec les nouveaux horaires', async () => {
      const monday = new Date('2024-03-04');
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        monday,
        '18:00',
        '20:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('ne devrait pas permettre de réservation le mercredi (jour fermé)', async () => {
      const wednesday = new Date('2024-03-06');
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        wednesday,
        '14:00',
        '16:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('ne devrait pas permettre de réservation le matin du jeudi', async () => {
      const thursday = new Date('2024-03-07');
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        thursday,
        '10:00',
        '12:00',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('devrait respecter la nouvelle pause déjeuner du vendredi', async () => {
      const friday = new Date('2024-03-08');
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        friday,
        '13:30',
        '15:30',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('period');
    });

    it('devrait permettre une réservation juste après la nouvelle pause déjeuner', async () => {
      const friday = new Date('2024-03-08');
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        kayakActivity,
        friday,
        '14:30',
        '16:30',
        1
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });
  });

  describe('Scénario 4 : Réservation avec chevauchement partiel', () => {
    // Configuration des ressources tennis
    const tennisRacket: Resource = {
      id: 'tennis-racket-1',
      name: 'Raquette de tennis',
      description: 'Raquette de tennis pour location',
      totalQuantity: 8,
      isActive: true,
      availability: []
    };

    // Configuration des formules tennis
    const twoHourTennisFormula: Formula = {
      id: 'tennis-2h',
      name: 'Location 2h',
      description: 'Location de raquette pour 2 heures',
      duration: 120,
      isActive: true,
      timeSlots: [{ time: '10:00' }],
      rates: [{
        id: 'rate-tennis-2h',
        name: 'Tarif standard 2h',
        price: 10,
        vat: 20
      }]
    };

    // Configuration de l'activité tennis
    const tennisActivity: Activity = {
      id: 'tennis-rental',
      name: 'Location de raquette',
      description: 'Location de raquette de tennis',
      shortDescription: 'Location raquette tennis',
      process: 'Récupérez votre raquette à l\'accueil',
      goodToKnow: 'Terrain non inclus',
      included: 'Raquette uniquement',
      isActive: true,
      duration: {
        duration: 120,
        setupTime: 5,
        cleanupTime: 5
      },
      pricing: {
        basePrice: 10
      },
      resources: [{
        resourceId: tennisRacket.id,
        quantity: 1
      }],
      maxParticipants: 8,
      isOnline: true,
      categories: [],
      formulas: [twoHourTennisFormula],
      paymentSettings: {
        depositRequired: false,
        depositAmount: 0,
        depositType: 'none'
      }
    };

    const march2nd = new Date('2024-03-02T10:00:00.000Z');

    beforeEach(() => {
      jest.clearAllMocks();
      // Réinitialiser l'état des réservations
      availabilityService.clearReservations();
    });

    it('devrait permettre la première réservation de 5 raquettes', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        tennisActivity,
        march2nd,
        '10:00',
        '12:00',
        5
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);

      // Créer la réservation
      await availabilityService.createReservation({
        activity: tennisActivity,
        date: march2nd,
        startTime: '10:00',
        endTime: '12:00',
        participants: 5
      });
    });

    it('ne devrait pas permettre une réservation de 4 raquettes sur un créneau qui chevauche', async () => {
      // Première réservation déjà faite de 5 raquettes de 10h à 12h
      await availabilityService.createReservation({
        activity: tennisActivity,
        date: march2nd,
        startTime: '10:00',
        endTime: '12:00',
        participants: 5
      });

      // Tentative de réserver 4 raquettes de 11h à 13h
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        tennisActivity,
        march2nd,
        '11:00',
        '13:00',
        4
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('resource');
    });

    it('devrait permettre une réservation de 3 raquettes sur un créneau qui chevauche', async () => {
      // Première réservation déjà faite de 5 raquettes de 10h à 12h
      await availabilityService.createReservation({
        activity: tennisActivity,
        date: march2nd,
        startTime: '10:00',
        endTime: '12:00',
        participants: 5
      });

      // Tentative de réserver 3 raquettes de 11h à 13h
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        tennisActivity,
        march2nd,
        '11:00',
        '13:00',
        3
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait permettre une réservation de 2 raquettes sur le même créneau', async () => {
      // Première réservation déjà faite de 5 raquettes de 10h à 12h
      await availabilityService.createReservation({
        activity: tennisActivity,
        date: march2nd,
        startTime: '10:00',
        endTime: '12:00',
        participants: 5
      });

      // Tentative de réserver 2 raquettes de 10h à 12h
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        tennisActivity,
        march2nd,
        '10:00',
        '12:00',
        2
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait calculer correctement les disponibilités sur les créneaux qui se chevauchent', async () => {
      // Première réservation : 5 raquettes de 10h à 12h
      await availabilityService.createReservation({
        activity: tennisActivity,
        date: march2nd,
        startTime: '10:00',
        endTime: '12:00',
        participants: 5
      });

      // Vérifier les disponibilités sur différents créneaux
      const availability10h = await availabilityService.getRemainingAvailability(
        tennisRacket.id,
        march2nd,
        '10:00',
        '12:00'
      );
      expect(availability10h).toBe(3); // 8 total - 5 réservées = 3 disponibles

      const availability11h = await availabilityService.getRemainingAvailability(
        tennisRacket.id,
        march2nd,
        '11:00',
        '13:00'
      );
      expect(availability11h).toBe(3); // De 11h à 12h, seulement 3 disponibles

      const availability12h = await availabilityService.getRemainingAvailability(
        tennisRacket.id,
        march2nd,
        '12:00',
        '14:00'
      );
      expect(availability12h).toBe(8); // Après 12h, toutes disponibles
    });
  });

  describe('Scénario 5 : Annulation de réservation et mise à jour des stocks', () => {
    // Configuration des ressources kayak 2 places
    const doubleKayak: Resource = {
      id: 'kayak-double-1',
      name: 'Kayak 2 places',
      description: 'Kayak biplace pour location',
      totalQuantity: 6,
      capacity: 2,
      isActive: true,
      availability: []
    };

    // Configuration des formules kayak 2 places
    const twoHourDoubleKayakFormula: Formula = {
      id: 'double-kayak-2h',
      name: 'Location 2h',
      description: 'Location de kayak 2 places pour 2 heures',
      duration: 120,
      isActive: true,
      timeSlots: [{ time: '14:00' }],
      rates: [{
        id: 'rate-double-2h',
        name: 'Tarif standard 2h',
        price: 35,
        vat: 20
      }]
    };

    // Configuration de l'activité kayak 2 places
    const doubleKayakActivity: Activity = {
      id: 'double-kayak-rental',
      name: 'Location de kayak 2 places',
      description: 'Location de kayak biplace',
      shortDescription: 'Location kayak 2 places',
      process: 'Arrivez 15 minutes avant, équipement fourni',
      goodToKnow: 'Savoir nager est obligatoire',
      included: 'Kayak, pagaies, gilets',
      isActive: true,
      duration: {
        duration: 120,
        setupTime: 15,
        cleanupTime: 15
      },
      pricing: {
        basePrice: 35
      },
      resources: [{
        resourceId: doubleKayak.id,
        quantity: 1
      }],
      maxParticipants: 12, // 6 kayaks * 2 places
      isOnline: true,
      categories: [],
      formulas: [twoHourDoubleKayakFormula],
      paymentSettings: {
        depositRequired: false,
        depositAmount: 0,
        depositType: 'none'
      }
    };

    const march3rd = new Date('2024-03-03T14:00:00.000Z');

    beforeEach(() => {
      jest.clearAllMocks();
      availabilityService.clearReservations();
    });

    it('devrait permettre la réservation initiale de 4 kayaks 2 places', async () => {
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        doubleKayakActivity,
        march3rd,
        '14:00',
        '16:00',
        4
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);

      // Créer la réservation
      const reservation = await availabilityService.createReservation({
        activity: doubleKayakActivity,
        date: march3rd,
        startTime: '14:00',
        endTime: '16:00',
        participants: 4
      });

      expect(reservation.id).toBeDefined();
    });

    it('ne devrait pas permettre une réservation de 3 kayaks quand il n\'en reste que 2', async () => {
      // Première réservation de 4 kayaks
      await availabilityService.createReservation({
        activity: doubleKayakActivity,
        date: march3rd,
        startTime: '14:00',
        endTime: '16:00',
        participants: 4
      });

      // Tentative de réserver 3 kayaks
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        doubleKayakActivity,
        march3rd,
        '14:00',
        '16:00',
        3
      );

      expect(availabilityCheck.isAvailable).toBe(false);
      expect(availabilityCheck.conflicts).toBeDefined();
      expect(availabilityCheck.conflicts![0].type).toBe('resource');
    });

    it('devrait mettre à jour les disponibilités après annulation', async () => {
      // Première réservation de 4 kayaks
      const reservation = await availabilityService.createReservation({
        activity: doubleKayakActivity,
        date: march3rd,
        startTime: '14:00',
        endTime: '16:00',
        participants: 4
      });

      // Annuler la réservation
      await availabilityService.cancelReservation(reservation.id);

      // Vérifier les disponibilités après annulation
      const availabilityAfterCancel = await availabilityService.getRemainingAvailability(
        doubleKayak.id,
        march3rd,
        '14:00',
        '16:00'
      );

      expect(availabilityAfterCancel).toBe(6); // Tous les kayaks sont à nouveau disponibles
    });

    it('devrait permettre une nouvelle réservation après annulation', async () => {
      // Première réservation de 4 kayaks
      const reservation = await availabilityService.createReservation({
        activity: doubleKayakActivity,
        date: march3rd,
        startTime: '14:00',
        endTime: '16:00',
        participants: 4
      });

      // Annuler la réservation
      await availabilityService.cancelReservation(reservation.id);

      // Tenter une nouvelle réservation de 3 kayaks
      const availabilityCheck = await availabilityService.checkActivityAvailability(
        doubleKayakActivity,
        march3rd,
        '14:00',
        '16:00',
        3
      );

      expect(availabilityCheck.isAvailable).toBe(true);
      expect(availabilityCheck.assignments).toBeDefined();
      expect(availabilityCheck.assignments!.length).toBeGreaterThan(0);
    });

    it('devrait mettre à jour les disponibilités instantanément après annulation', async () => {
      // Première réservation de 4 kayaks
      const reservation = await availabilityService.createReservation({
        activity: doubleKayakActivity,
        date: march3rd,
        startTime: '14:00',
        endTime: '16:00',
        participants: 4
      });

      // Vérifier les disponibilités avant annulation
      const availabilityBeforeCancel = await availabilityService.getRemainingAvailability(
        doubleKayak.id,
        march3rd,
        '14:00',
        '16:00'
      );
      expect(availabilityBeforeCancel).toBe(2); // 6 total - 4 réservés = 2 disponibles

      // Annuler la réservation
      await availabilityService.cancelReservation(reservation.id);

      // Vérifier les disponibilités immédiatement après annulation
      const availabilityAfterCancel = await availabilityService.getRemainingAvailability(
        doubleKayak.id,
        march3rd,
        '14:00',
        '16:00'
      );
      expect(availabilityAfterCancel).toBe(6); // Tous les kayaks sont immédiatement disponibles
    });
  });
});
