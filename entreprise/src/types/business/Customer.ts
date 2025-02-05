export interface CustomerContact {
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface CustomerStats {
  totalReservations: number;
  totalSpent: number;
  lastReservation?: string;
  averageReservationValue: number;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  contact: CustomerContact;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  stats: CustomerStats;
  notes?: string;
  gdprConsent?: {
    marketing: boolean;
    dateAccepted?: string;
  };
}
