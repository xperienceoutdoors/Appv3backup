import { Company } from '../types/company';

export const mockCompanies: Company[] = [
  {
    id: '1',
    status: 'active',
    name: 'Nautique Aventures',
    address: '15 rue de la Plage',
    postalCode: '34200',
    city: 'Sète',
    country: 'France',
    phone: '04 67 12 34 56',
    email: 'contact@nautique-aventures.fr',
    website: 'www.nautique-aventures.fr',
    sector: 'Location de bateaux',
    fiscalNumber: '123456789',
    vatNumber: 'FR123456789',
    legalRepresentative: {
      firstName: 'Jean',
      lastName: 'Dupont',
      position: 'Gérant',
      phone: '06 12 34 56 78',
      email: 'jean.dupont@nautique-aventures.fr'
    },
    employeeCount: 12,
    annualRevenue: '100000-200000',
    description: 'Location de bateaux et activités nautiques sur la côte méditerranéenne',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    status: 'active',
    name: 'Ocean Loisirs',
    address: '45 boulevard des Vagues',
    postalCode: '13008',
    city: 'Marseille',
    country: 'France',
    phone: '04 91 23 45 67',
    email: 'contact@ocean-loisirs.fr',
    website: 'www.ocean-loisirs.fr',
    sector: 'Sports nautiques',
    fiscalNumber: '987654321',
    vatNumber: 'FR987654321',
    legalRepresentative: {
      firstName: 'Marie',
      lastName: 'Martin',
      position: 'Directrice',
      phone: '06 98 76 54 32',
      email: 'marie.martin@ocean-loisirs.fr'
    },
    employeeCount: 8,
    annualRevenue: '50000-100000',
    description: 'École de voile et location de matériel nautique',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];
