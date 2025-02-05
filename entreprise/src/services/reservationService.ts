import { v4 as uuidv4 } from 'uuid';
import { Reservation } from '../types/business/Reservation';
import { ModificationRecord } from '../types/business/ModificationRecord';
import { format } from 'date-fns';
import { customerService } from './customerService';
import { resourceService } from './resourceService';
import { emailService } from './emailService';

const STORAGE_KEY = 'reservations';

interface FilterOptions {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  customerEmail?: string;
}

const reservationService = {
  initialize: async (): Promise<void> => {
    const defaultReservations: Reservation[] = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultReservations));
  },

  getAll: async (): Promise<Reservation[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        await reservationService.initialize();
        return [];
      }
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Reservation | null> => {
    const reservations = await reservationService.getAll();
    return reservations.find(r => r.id === id) || null;
  },

  create: async (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Promise<Reservation> => {
    try {
      const reservations = await reservationService.getAll();
      
      const newReservation: Reservation = {
        ...reservationData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'confirmed',
        modificationHistory: [{
          id: crypto.randomUUID(),
          date: new Date(),
          description: 'Réservation créée',
          user: 'Admin'
        }]
      };

      reservations.push(newReservation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));

      // Mettre à jour les statistiques du client
      if (newReservation.customer?.id) {
        await customerService.updateStats(newReservation.customer.id, newReservation);
      }

      // Envoyer l'email de confirmation
      await emailService.sendReservationConfirmation(newReservation);

      return newReservation;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw new Error('Impossible de créer la réservation');
    }
  },

  update: async (id: string, updates: Partial<Reservation>): Promise<Reservation> => {
    try {
      const reservations = await reservationService.getAll();
      const index = reservations.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Réservation non trouvée');
      
      const oldReservation = reservations[index];
      const changes: string[] = [];

      // Vérifier les changements pour l'historique
      if (updates.startDate && format(new Date(updates.startDate), 'yyyy-MM-dd HH:mm') !== 
          format(new Date(oldReservation.startDate), 'yyyy-MM-dd HH:mm')) {
        changes.push('Date modifiée');
      }

      if (updates.status && updates.status !== oldReservation.status) {
        changes.push('Statut modifié');
      }

      if (updates.totalAmount && updates.totalAmount !== oldReservation.totalAmount) {
        changes.push('Montant modifié');
      }

      reservations[index] = {
        ...oldReservation,
        ...updates,
        modificationHistory: [
          ...oldReservation.modificationHistory,
          {
            id: crypto.randomUUID(),
            date: new Date(),
            description: changes.join(', '),
            user: 'Admin'
          }
        ]
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));

      // Envoyer l'email de modification si nécessaire
      if (changes.length > 0) {
        await emailService.sendModificationNotification(reservations[index], changes);
      }

      return reservations[index];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      throw new Error('Impossible de mettre à jour la réservation');
    }
  },

  cancel: async (id: string): Promise<void> => {
    const reservation = await reservationService.getById(id);
    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    await reservationService.update(id, {
      status: 'annulée',
      modificationHistory: [
        ...reservation.modificationHistory,
        {
          id: crypto.randomUUID(),
          date: new Date(),
          description: 'Réservation annulée',
          user: 'Admin'
        }
      ]
    });

    // Envoyer l'email d'annulation
    await emailService.sendCancellationNotification(reservation);
  },

  updateNotes: async (id: string, notes: string): Promise<void> => {
    const reservation = await reservationService.getById(id);
    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    await reservationService.update(id, {
      notes,
      modificationHistory: [
        ...reservation.modificationHistory,
        {
          id: crypto.randomUUID(),
          date: new Date(),
          description: 'Notes mises à jour',
          user: 'Admin'
        }
      ]
    });
  },

  filter: async (options: FilterOptions): Promise<Reservation[]> => {
    let reservations = await reservationService.getAll();

    if (options.startDate) {
      reservations = reservations.filter(r => 
        new Date(r.startDate) >= new Date(options.startDate!)
      );
    }

    if (options.endDate) {
      reservations = reservations.filter(r => 
        new Date(r.startDate) <= new Date(options.endDate!)
      );
    }

    if (options.status) {
      reservations = reservations.filter(r => r.status === options.status);
    }

    if (options.customerEmail) {
      reservations = reservations.filter(r => 
        r.customer.email.toLowerCase() === options.customerEmail!.toLowerCase()
      );
    }

    return reservations;
  },

  getStats: async (startDate: Date, endDate: Date) => {
    const reservations = await reservationService.filter({ startDate, endDate });
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'confirmée').length,
      pending: reservations.filter(r => r.status === 'en attente').length,
      cancelled: reservations.filter(r => r.status === 'annulée').length,
      totalAmount: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
      averageAmount: reservations.length > 0
        ? reservations.reduce((sum, r) => sum + r.totalAmount, 0) / reservations.length
        : 0
    };
  }
};

export { reservationService };
