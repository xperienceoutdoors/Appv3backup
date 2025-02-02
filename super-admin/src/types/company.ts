export type CompanyStatus = 'active' | 'inactive';
export type RevenueRange = '< 50000' | '50000-100000' | '100000-200000' | '> 200000';

export interface Company {
  id: string;
  status: CompanyStatus;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  sector: string;
  fiscalNumber: string;
  vatNumber: string;
  
  // Représentant légal
  legalRepresentative: {
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
  };

  // Informations additionnelles
  employeeCount: number;
  annualRevenue: string;
  description: string;

  // Abonnement
  subscription: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'pending' | 'cancelled';
    startDate: Date;
    endDate?: Date;
    price: number;
  };

  createdAt: Date;
  updatedAt: Date;
}
