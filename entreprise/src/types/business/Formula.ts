export interface TimeSlot {
  time: string;     // Format "HH:mm"
}

export interface RateResource {
  resourceId: string;
  quantity: number;
}

export interface Rate {
  id: string;
  name: string;
  price: number;
  vat: number;      // TVA en pourcentage
  resources: RateResource[];  // Ressources nécessaires pour ce tarif
}

export interface Formula {
  id: string;
  name: string;
  description?: string;
  duration: number;
  isActive: boolean;
  timeSlots: TimeSlot[];
  rates: Rate[];
}
