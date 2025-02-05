export interface Establishment {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logo?: string;
  photos?: string[];
}

export interface OpeningPeriod {
  id?: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  activities: string[];
  openingDays: {
    [key: string]: {
      isOpen: boolean;
      hours: Array<{
        start: string;
        end: string;
      }>;
    };
  };
}

export interface Resource {
  id?: string;
  name: string;
  quantity: number;
  maxCapacity: number;
  description: string;
  photo?: string;
  ageRange: {
    min: number;
    max?: number;
  };
}

export interface Category {
  id?: string;
  name: string;
  activitiesCount?: number;
}

export interface ActivityPackage {
  id?: string;
  name: string;
  duration: number;
  departureTimes: string[];
  rates: Array<{
    name: string;
    price: number;
    description?: string;
  }>;
}

export interface Activity {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  photo?: string;
  details: {
    description: string;
    process: string;
    goodToKnow: string;
  };
  resources: string[];
  packages: ActivityPackage[];
  isOnline: boolean;
}
