export interface BookingFormData {
  // Step 1: Activity Selection
  activityId?: string;
  
  // Step 2: Date & Time
  date?: string;
  timeSlot?: string;
  
  // Step 3: Participants & Resources
  participants?: Record<string, number>;
  resources?: Record<string, number>;
  
  // Step 4: Customer Information
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createAccount?: boolean;
  };
  
  // Step 5: Payment
  payment?: {
    method: 'card' | 'paypal' | 'other';
    status?: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    error?: string;
  };
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  maxCapacity: number;
  currentBookings: number;
}

export type BookingStep = 
  | 'activity'
  | 'datetime'
  | 'participants'
  | 'customer'
  | 'payment'
  | 'confirmation';
