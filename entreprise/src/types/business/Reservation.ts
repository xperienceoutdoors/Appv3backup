import { Customer } from './Customer';
import { Activity } from './Activity';
import { Formula } from './Formula';
import { Resource } from './Resource';
import { ModificationRecord } from './ModificationRecord';
import { ReservationPayment } from './ReservationPayment';

export type ReservationStatus = 'confirmée' | 'en attente' | 'annulée';

export interface Reservation {
  id: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  activity: {
    id: string;
    name: string;
    categoryId: string;
  };
  formula?: {
    id: string;
    name: string;
    price: number;
  };
  activityDate: Date;
  startTime: string;
  participants: number;
  totalPrice: number;
  status: ReservationStatus;
  paymentMethod?: 'card' | 'cash';
  createdAt: string;
  notes?: string;
  payments?: ReservationPayment[];
  modificationHistory: ModificationRecord[];
}
