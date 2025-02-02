export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  status: 'active' | 'inactive';
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  subscriptionEndDate?: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
}

export interface Payment {
  id: string;
  companyId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  subscriptionPlanId: string;
}

export interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
}
