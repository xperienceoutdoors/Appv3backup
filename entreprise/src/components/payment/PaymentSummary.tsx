import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Reservation } from '../../types/business/Reservation';
import { ReservationPayment } from '../../types/business/ReservationPayment';

interface PaymentSummaryProps {
  reservation: Reservation;
  onCompletePayment?: () => void;
}

const PaymentSummary = ({ reservation, onCompletePayment }: PaymentSummaryProps) => {
  const [payments, setPayments] = useState<ReservationPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, [reservation.id]);

  const loadPayments = async () => {
    try {
      const response = await fetch(`/api/reservation-payments/${reservation.id}`);
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = reservation.totalAmount - totalPaid;

  if (isLoading) {
    return <div>Chargement des paiements...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Résumé des paiements</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span>Montant total</span>
          <span className="font-medium">{reservation.totalAmount}€</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Montant payé</span>
          <span className="font-medium text-green-600">{totalPaid}€</span>
        </div>
        {remainingAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Reste à payer</span>
            <span className="font-medium">{remainingAmount}€</span>
          </div>
        )}
      </div>

      {payments.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Historique des paiements</h4>
          <div className="space-y-2">
            {payments.map(payment => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-2 bg-white rounded border"
              >
                <div>
                  <div className="text-sm font-medium">
                    {payment.amount}€ par {payment.method}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(payment.date), 'PPP', { locale: fr })}
                  </div>
                </div>
                <div className={`text-sm ${
                  payment.status === 'confirmé' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {payment.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {remainingAmount > 0 && onCompletePayment && (
        <button
          onClick={onCompletePayment}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Payer le solde ({remainingAmount}€)
        </button>
      )}
    </div>
  );
};

export default PaymentSummary;
