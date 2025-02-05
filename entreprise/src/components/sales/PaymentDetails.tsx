import React from 'react';
import { ReservationPayment } from '../../types/business/ReservationPayment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PaymentDetailsProps {
  payments: ReservationPayment[];
  totalAmount: number;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payments, totalAmount }) => {
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingAmount = totalAmount - totalPaid;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'carte':
        return (
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'espèces':
        return (
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'virement':
        return (
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'chèque':
        return (
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* En-tête avec résumé */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Payé</p>
            <p className="text-lg font-semibold text-green-600">{formatCurrency(totalPaid)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Reste à payer</p>
            <p className={`text-lg font-semibold ${remainingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(remainingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Liste des paiements */}
      <div className="divide-y divide-gray-200">
        {payments.length === 0 ? (
          <p className="p-4 text-sm text-gray-500 text-center">
            Aucun paiement enregistré
          </p>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getPaymentMethodIcon(payment.method)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.method.charAt(0).toUpperCase() + payment.method.slice(1)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.date), 'Pp', { locale: fr })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </p>
                  <p className={`text-sm ${
                    payment.status === 'confirmé' ? 'text-green-600' :
                    payment.status === 'en attente' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {payment.status}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PaymentDetails;
