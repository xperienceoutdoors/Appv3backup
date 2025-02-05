import { Category } from '../types/business/Category';
import { Resource } from '../types/business/Resource';
import { Activity } from '../types/business/Activity';
import { Formula } from '../types/business/Formula';

// Catégories
const categories: Category[] = [
  {
    id: 'cat1',
    name: 'Sports Nautiques',
    description: 'Activités sur l\'eau',
    isActive: true,
  },
  {
    id: 'cat2',
    name: 'Aventure',
    description: 'Activités d\'aventure',
    isActive: true,
  },
  {
    id: 'cat3',
    name: 'Détente',
    description: 'Activités de détente',
    isActive: true,
  },
];

// Ressources
const resources: Resource[] = [
  {
    id: 'res1',
    name: 'Kayaks',
    description: 'Kayaks pour 1 à 2 personnes',
    quantity: 10,
    isActive: true,
  },
  {
    id: 'res2',
    name: 'Paddles',
    description: 'Planches de paddle',
    quantity: 8,
    isActive: true,
  },
  {
    id: 'res3',
    name: 'Combinaisons',
    description: 'Combinaisons néoprène',
    quantity: 20,
    isActive: true,
  },
];

// Activités
const activities: Activity[] = [
  {
    id: 'act1',
    name: 'Kayak Découverte',
    description: 'Découvrez nos rivières en kayak',
    shortDescription: 'Balade en kayak guidée',
    process: 'Arrivée 15min avant\nÉquipement\nBriefing sécurité\nMise à l\'eau',
    goodToKnow: 'Savoir nager\nPrévoir maillot et serviette\nChaussures fermées obligatoires',
    included: 'Kayak\nPagaie\nGilet de sauvetage\nBidon étanche',
    duration: { duration: 120 },
    pricing: {
      basePrice: 35,
      childPrice: 25,
      groupPrice: 30,
    },
    maxParticipants: 8,
    minAge: 12,
    minHeight: 140,
    resources: [
      { resourceId: 'res1', quantity: 1 },
      { resourceId: 'res3', quantity: 1 },
    ],
    categories: ['cat1'],
    isActive: true,
    isOnline: true,
  },
  {
    id: 'act2',
    name: 'Paddle Zen',
    description: 'Balade en paddle sur le lac',
    shortDescription: 'Session de paddle sur lac calme',
    process: 'Arrivée 15min avant\nÉquipement\nInitiation sur la plage\nMise à l\'eau',
    goodToKnow: 'Savoir nager\nPrévoir maillot et serviette\nCrème solaire conseillée',
    included: 'Planche de paddle\nPagaie\nGilet de sauvetage\nLeash',
    duration: { duration: 60 },
    pricing: {
      basePrice: 25,
      childPrice: 20,
      groupPrice: 22,
    },
    maxParticipants: 6,
    minAge: 10,
    minHeight: 140,
    resources: [
      { resourceId: 'res2', quantity: 1 },
      { resourceId: 'res3', quantity: 1 },
    ],
    categories: ['cat1', 'cat3'],
    isActive: true,
    isOnline: true,
  },
];

// Formules
const formulas: Formula[] = [
  {
    id: 'form1',
    activityId: 'act1',
    name: 'Découverte',
    description: 'Formule découverte 2h',
    duration: { duration: 120 },
    pricing: {
      basePrice: 35,
      childPrice: 25,
      groupPrice: 30,
    },
    maxParticipants: 8,
    isActive: true,
  },
  {
    id: 'form2',
    activityId: 'act1',
    name: 'Initiation',
    description: 'Formule initiation 1h',
    duration: { duration: 60 },
    pricing: {
      basePrice: 25,
      childPrice: 20,
      groupPrice: 22,
    },
    maxParticipants: 6,
    isActive: true,
  },
  {
    id: 'form3',
    activityId: 'act2',
    name: 'Zen',
    description: 'Session zen de paddle',
    duration: { duration: 60 },
    pricing: {
      basePrice: 25,
      childPrice: 20,
      groupPrice: 22,
    },
    maxParticipants: 6,
    isActive: true,
  },
];

// Fonction pour sauvegarder les données dans le localStorage
const saveTestData = () => {
  localStorage.setItem('categories', JSON.stringify(categories));
  localStorage.setItem('resources', JSON.stringify(resources));
  localStorage.setItem('activities', JSON.stringify(activities));
  localStorage.setItem('formulas', JSON.stringify(formulas));
  
  console.log('Données de test générées avec succès !');
  console.log(`${categories.length} catégories`);
  console.log(`${resources.length} ressources`);
  console.log(`${activities.length} activités`);
  console.log(`${formulas.length} formules`);
};

export const generateTestData = () => {
  saveTestData();
  window.location.reload();
};

export default generateTestData;
