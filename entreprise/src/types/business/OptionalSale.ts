export interface OptionalSale {
  id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
  activities: string[]; // IDs des activités associées
  type: 'service' | 'product' | 'insurance' | 'other';
  unit?: string; // Par exemple "par personne", "par groupe", etc.
}
