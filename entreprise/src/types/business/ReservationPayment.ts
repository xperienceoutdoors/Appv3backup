export interface ReservationPayment {
  id: string;
  date: Date;
  method: 'carte' | 'espèces' | 'virement' | 'chèque';
  amount: number;
  status: 'confirmé' | 'en attente' | 'annulé';
  notes?: string;
}
