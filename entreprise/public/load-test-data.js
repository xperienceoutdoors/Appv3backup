// Configuration de base pour les tests de réservation
const testData = {
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
      quantity: 5  // Stock initial de 5 kayaks
    }],
    formulas: [
      {
        id: 'formula-2h',
        name: '2 heures de Kayak',
        description: 'Location de kayak pour 2 heures',
        duration: 120,
        isActive: true,
        timeSlots: [
          {time: '10:00'},
          {time: '12:00'},
          {time: '14:00'},
          {time: '16:00'}
        ],
        rates: [{
          id: 'rate-standard',
          name: 'Tarif standard',
          price: 45,
          vat: 20
        }]
      },
      {
        id: 'formula-4h',
        name: '4 heures de Kayak',
        description: 'Location de kayak pour 4 heures',
        duration: 240,
        isActive: true,
        timeSlots: [
          {time: '10:00'},
          {time: '14:00'}
        ],
        rates: [{
          id: 'rate-4h',
          name: 'Tarif 4h',
          price: 80,
          vat: 20
        }]
      }
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
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
  }],
  
  resources: [{
    id: 'kayak-double',
    name: 'Kayak Double',
    description: 'Kayak 2 places stable et confortable',
    totalQuantity: 5,
    isActive: true
  }],

  // Configuration du système
  config: {
    cartTimeout: 15 * 60 * 1000, // 15 minutes en millisecondes
    checkOverlap: true,
    blockOnCart: true
  }
};

// Fonction pour simuler le temps d'expiration du panier
function startCartTimer(callback) {
  return setTimeout(callback, testData.config.cartTimeout);
}

// Charger les données dans le localStorage seulement si elles n'existent pas déjà
console.log('Chargement des données de test...');

// Fonction pour charger les données si elles n'existent pas
function loadDataIfNotExists(key, data) {
  const existingData = localStorage.getItem(key);
  if (!existingData) {
    console.log(`Sauvegarde des ${key}...`, data);
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    console.log(`${key} existants trouvés, pas de chargement des données de test`);
  }
}

loadDataIfNotExists('activities', testData.activities);
loadDataIfNotExists('periods', testData.periods);
loadDataIfNotExists('resources', testData.resources);
loadDataIfNotExists('config', testData.config);

// Vérifier que les données ont été sauvegardées
console.log('Vérification des données sauvegardées :');
console.log('Activités:', localStorage.getItem('activities'));
console.log('Périodes:', localStorage.getItem('periods'));
console.log('Ressources:', localStorage.getItem('resources'));
console.log('Configuration:', localStorage.getItem('config'));

// Initialiser les réservations seulement si elles n'existent pas
if (!localStorage.getItem('reservations')) {
  localStorage.setItem('reservations', JSON.stringify([]));
}

// Fonctions de test
window.testUtils = {
  // Vérifier l'état des ressources
  checkResourceAvailability: async (date, startTime, endTime) => {
    const activity = JSON.parse(localStorage.getItem('activities'))[0];
    const resource = JSON.parse(localStorage.getItem('resources'))[0];
    console.log('État des ressources :', {
      totalKayaks: resource.totalQuantity,
      date,
      startTime,
      endTime
    });
    return resource.totalQuantity;
  },

  // Simuler une réservation
  createReservation: async (date, startTime, endTime, quantity) => {
    const reservation = {
      id: `res-${Date.now()}`,
      activityId: 'kayak-activity',
      date,
      startTime,
      endTime,
      quantity,
      status: 'pending',
      createdAt: new Date()
    };

    // Sauvegarder la réservation
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    console.log('Nouvelle réservation créée :', reservation);
    return reservation;
  },

  // Vérifier le statut d'une réservation
  checkReservationStatus: (reservationId) => {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const reservation = reservations.find(r => r.id === reservationId);
    console.log('Statut de la réservation :', reservation?.status);
    return reservation?.status;
  },

  // Réinitialiser les données de test
  resetTestData: () => {
    localStorage.setItem('activities', JSON.stringify(testData.activities));
    localStorage.setItem('periods', JSON.stringify(testData.periods));
    localStorage.setItem('resources', JSON.stringify(testData.resources));
    localStorage.setItem('reservations', JSON.stringify([]));
    console.log('Données de test réinitialisées');
  }
};

console.log('Données de test chargées avec succès');
console.log('Utilisez window.testUtils pour exécuter les tests');
