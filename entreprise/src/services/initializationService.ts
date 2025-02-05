import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours } from 'date-fns';
import { reservationService } from './reservationService';

const activities = [
  {
    id: '1',
    name: 'Cours de surf débutant',
    description: 'Initiation au surf pour les débutants',
    price: 50
  },
  {
    id: '2',
    name: 'Location de planche',
    description: 'Location de planche de surf à la journée',
    price: 25
  }
];

const customers = [
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '0612345678'
  },
  {
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    phone: '0687654321'
  }
];

const createTestReservations = async () => {
  const startDate = new Date();
  
  const reservations = [
    {
      customer: customers[0],
      activity: activities[0],
      startDate: addHours(startDate, 2),
      endDate: addHours(startDate, 4),
      status: 'confirmée',
      totalAmount: activities[0].price,
      notes: 'Première leçon'
    },
    {
      customer: customers[1],
      activity: activities[1],
      startDate: addDays(startDate, 1),
      endDate: addDays(addHours(startDate, 8), 1),
      status: 'en attente',
      totalAmount: activities[1].price,
      notes: 'Location journée complète'
    },
    {
      customer: customers[0],
      activity: activities[0],
      startDate: addDays(startDate, 2),
      endDate: addDays(addHours(startDate, 2), 2),
      status: 'annulée',
      totalAmount: activities[0].price,
      notes: 'Annulé pour cause de météo'
    }
  ];

  for (const reservation of reservations) {
    await reservationService.create(reservation);
  }

  console.log('Données de test créées avec succès !');
};

const initializationService = {
  async initialize() {
    const currentReservations = await reservationService.getAll();
    if (currentReservations.length === 0) {
      await createTestReservations();
    }
  }
};

export default initializationService;
