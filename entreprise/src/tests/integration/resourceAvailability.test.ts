import { availabilityService } from '../../services/availabilityService';
import { Activity } from '../../types/business/Activity';
import { Formula } from '../../types/business/Formula';
import { Resource } from '../../types/business/Resource';

describe('Resource Availability Integration Tests', () => {
  // Configuration initiale
  const setupTestData = () => {
    // Créer une activité avec une formule qui utilise des ressources
    const activity: Activity = {
      id: 'test-activity',
      name: 'Test Activity',
      isActive: true,
      // ... autres propriétés requises
    };

    const resource: Resource = {
      id: 'test-resource',
      name: 'Test Resource',
      totalQuantity: 10,
      isActive: true,
      // ... autres propriétés requises
    };

    const formula: Formula = {
      id: 'test-formula',
      activityId: activity.id,
      name: 'Test Formula',
      duration: 60,
      rates: [{
        id: 'rate1',
        name: 'Standard Rate',
        price: 100,
        resources: [{
          resourceId: resource.id,
          quantity: 2
        }]
      }],
      isActive: true,
      // ... autres propriétés requises
    };

    return { activity, resource, formula };
  };

  beforeEach(() => {
    // Réinitialiser l'état du service
    availabilityService.clearReservations();
  });

  describe('Scénario de réservations multiples', () => {
    it('devrait gérer correctement plusieurs réservations simultanées', async () => {
      const { activity, formula } = setupTestData();
      const date = new Date('2025-02-03');

      // Première réservation (4 ressources : 2 par personne * 2 participants)
      const reservation1 = await availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '10:00',
        participants: 2
      });

      expect(reservation1).toBeDefined();
      expect(reservation1.resources[0].quantity).toBe(4);

      // Deuxième réservation (même créneau, devrait être possible car il reste 6 ressources)
      const reservation2 = await availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '10:00',
        participants: 2
      });

      expect(reservation2).toBeDefined();
      expect(reservation2.resources[0].quantity).toBe(4);

      // Troisième réservation (devrait échouer car il ne reste que 2 ressources)
      await expect(availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '10:00',
        participants: 2
      })).rejects.toThrow('Créneau non disponible');
    });

    it('devrait gérer correctement les créneaux qui se chevauchent', async () => {
      const { activity, formula } = setupTestData();
      const date = new Date('2025-02-03');

      // Première réservation de 10:00 à 11:00
      const reservation1 = await availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '10:00',
        participants: 2
      });

      expect(reservation1).toBeDefined();

      // Deuxième réservation de 10:30 à 11:30 (chevauchement)
      await expect(availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '10:30',
        participants: 4 // Utiliserait 8 ressources
      })).rejects.toThrow('Créneau non disponible');

      // Troisième réservation de 11:00 à 12:00 (devrait fonctionner)
      const reservation3 = await availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '11:00',
        participants: 4
      });

      expect(reservation3).toBeDefined();
    });
  });

  describe('Scénario de vérification de disponibilité', () => {
    it('devrait correctement calculer la disponibilité restante', async () => {
      const { activity, formula } = setupTestData();
      const date = new Date('2025-02-03');

      // Créer une réservation qui utilise 4 ressources
      await availabilityService.createReservation({
        activity,
        formula,
        date,
        startTime: '10:00',
        participants: 2
      });

      // Vérifier la disponibilité pour le même créneau
      const availability = await availabilityService.checkActivityAvailability(
        activity,
        formula,
        date,
        '10:00',
        '11:00',
        3 // 6 ressources nécessaires
      );

      // Ne devrait pas être disponible car il ne reste que 6 ressources
      expect(availability.isAvailable).toBe(false);
    });
  });
});
