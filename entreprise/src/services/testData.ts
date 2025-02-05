import { customerService } from './customerService';
import { reservationService } from './reservationService';
import { activityService } from './activityService';

export const generateTestData = async () => {
  try {
    console.log("Initialisation des services...");
    
    // Initialiser les services
    await customerService.initialize();
    await activityService.initialize();
    await reservationService.initialize();

    // Récupérer les données nécessaires
    const activities = await activityService.getAll();
    const customers = await customerService.getAll();

    console.log("Données initiales chargées:", {
      activitiesCount: activities.length,
      customersCount: customers.length
    });

    // Dates pour les réservations
    const dates = [
      new Date(2025, 1, 5), // Aujourd'hui
      new Date(2025, 1, 6), // Demain
      new Date(2025, 1, 7), // Après-demain
      new Date(2025, 1, 10) // La semaine prochaine
    ];

    // Créneaux horaires
    const timeSlots = ['10:00', '11:00', '14:00', '15:00', '16:00'];

    // Générer des réservations
    let reservationsCreated = 0;

    for (const customer of customers) {
      for (const activity of activities) {
        // Choisir une formule au hasard
        const formula = activity.formulas[Math.floor(Math.random() * activity.formulas.length)];
        
        // Choisir une date au hasard
        const date = dates[Math.floor(Math.random() * dates.length)];
        
        // Choisir un créneau au hasard
        const startTime = timeSlots[Math.floor(Math.random() * timeSlots.length)];

        // Créer la réservation
        const reservationData = {
          customer: {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.contact.email,
            phone: customer.contact.phone
          },
          activity: {
            id: activity.id,
            name: activity.name,
            categoryId: activity.categoryId
          },
          formula: {
            id: formula.id,
            name: formula.name,
            price: formula.price
          },
          activityDate: date,
          startTime: startTime,
          participants: activity.minParticipants,
          totalPrice: formula.price,
          paymentMethod: Math.random() > 0.5 ? 'card' : 'cash',
          status: 'confirmed' as const
        };

        try {
          const reservation = await reservationService.create(reservationData);
          console.log("Réservation créée:", {
            id: reservation.id,
            customer: `${customer.firstName} ${customer.lastName}`,
            activity: activity.name,
            date: date.toLocaleDateString(),
            time: startTime
          });
          reservationsCreated++;
        } catch (error) {
          console.error("Erreur lors de la création de la réservation:", error);
        }
      }
    }

    console.log("Génération des données de test terminée", {
      reservationsCreated
    });
  } catch (error) {
    console.error("Erreur lors de la génération des données de test:", error);
    throw error;
  }
};
