import { Reservation } from '../types/business/Reservation';

class EmailService {
  async sendConfirmation(reservation: Reservation): Promise<void> {
    console.log('Envoi de l\'email de confirmation pour la réservation:', reservation.id);
    // TODO: Implémenter l'envoi d'email
  }

  async sendModification(reservation: Reservation): Promise<void> {
    console.log('Envoi de l\'email de modification pour la réservation:', reservation.id);
    // TODO: Implémenter l'envoi d'email
  }

  async sendCancellation(reservation: Reservation): Promise<void> {
    console.log('Envoi de l\'email d\'annulation pour la réservation:', reservation.id);
    // TODO: Implémenter l'envoi d'email
  }

  async sendReminder(reservation: Reservation): Promise<void> {
    console.log('Envoi de l\'email de rappel pour la réservation:', reservation.id);
    // TODO: Implémenter l'envoi d'email
  }
}

export const emailService = new EmailService();

export default emailService;