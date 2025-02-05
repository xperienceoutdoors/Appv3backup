
// Activités
const activities = JSON.parse('{
  "id": "test-activity-1",
  "name": "Location de Kayak",
  "description": "Location de kayak pour 2 personnes",
  "process": "1. Arrivée 15min avant\n2. Équipement\n3. Briefing sécurité\n4. Navigation",
  "goodToKnow": "Savoir nager est obligatoire",
  "included": "Kayak, pagaies, gilets",
  "duration": {
    "duration": 120,
    "setupTime": 15,
    "cleanupTime": 15
  },
  "pricing": {
    "basePrice": 45
  },
  "resources": [
    {
      "id": "resource-1",
      "resourceId": "kayak-double",
      "quantity": 1
    }
  ],
  "formulas": [
    {
      "id": "formula-1",
      "name": "2h de Kayak",
      "description": "Location de kayak pour 2 personnes pendant 2h",
      "duration": 120,
      "isActive": true,
      "timeSlots": [
        {"time": "09:00"},
        {"time": "11:30"},
        {"time": "14:00"},
        {"time": "16:30"}
      ],
      "rates": [
        {
          "id": "rate-1",
          "name": "Tarif normal",
          "price": 45,
          "vat": 20
        }
      ]
    }
  ],
  "isActive": true
}');
localStorage.setItem('activities', JSON.stringify([activities]));

// Périodes
const periods = JSON.parse('{
  "id": "test-period-1",
  "name": "Période Printemps 2025",
  "description": "Période de test pour le printemps 2025",
  "startDate": "2025-02-01",
  "endDate": "2025-05-31",
  "schedules": {
    "monday": {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    },
    "tuesday": {
      "dayOfWeek": 2,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    },
    "wednesday": {
      "dayOfWeek": 3,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    },
    "thursday": {
      "dayOfWeek": 4,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    },
    "friday": {
      "dayOfWeek": 5,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    },
    "saturday": {
      "dayOfWeek": 6,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": true
    },
    "sunday": {
      "dayOfWeek": 7,
      "startTime": "09:00",
      "endTime": "18:00",
      "isActive": false
    }
  },
  "activities": ["test-activity-1"],
  "isActive": true
}');
localStorage.setItem('periods', JSON.stringify([periods]));

// Ressources
const resources = JSON.parse('{
  "id": "kayak-double",
  "name": "Kayak Double",
  "description": "Kayak 2 places stable et confortable",
  "totalQuantity": 5,
  "isActive": true
}');
localStorage.setItem('resources', JSON.stringify([resources]));

console.log('Données de test chargées avec succès');

