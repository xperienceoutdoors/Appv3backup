import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Reservation } from '../../types/business/Reservation';
import { PaymentMethod } from '../../types/business/Activity';
import { reservationService } from '../../services/reservationService';
import PaymentMethodSelector from './PaymentMethodSelector';

interface PaymentFormProps {
  reservation: Reservation;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentForm = ({ reservation, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    reservation.activity.paymentSettings.allowedMethods[0]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (paymentMethod === 'onsite') {
      try {
        await reservationService.update(reservation.id, {
          status: 'confirmée',
          paymentMethod: 'onsite'
        });
        onSuccess();
        return;
      } catch (error) {
        onError('Erreur lors de la confirmation de la réservation');
        return;
      }
    }

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setProcessing(true);

    try {
      // Calculer le montant à payer
      const amount = paymentMethod === 'deposit'
        ? (reservation.totalAmount * reservation.activity.paymentSettings.depositPercentage) / 100
        : reservation.totalAmount;

      // Créer l'intention de paiement
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe utilise les centimes
          reservationId: reservation.id,
          paymentMethod,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirmer le paiement
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${reservation.customer.firstName} ${reservation.customer.lastName}`,
            email: reservation.customer.email,
          },
        },
      });

      if (error) {
        onError(error.message || 'Une erreur est survenue lors du paiement');
      } else if (paymentIntent.status === 'succeeded') {
        // Mettre à jour la réservation avec le paiement
        await reservationService.update(reservation.id, {
          status: 'confirmée',
          payments: [
            ...(reservation.payments || []),
            {
              id: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              method: 'carte',
              status: 'confirmé',
              date: new Date(),
              reference: paymentIntent.id
            }
          ],
          paymentMethod,
          remainingAmount: paymentMethod === 'deposit' ? reservation.totalAmount - amount : 0
        });
        onSuccess();
      }
    } catch (error) {
      onError('Une erreur est survenue lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentMethodSelector
        allowedMethods={reservation.activity.paymentSettings.allowedMethods}
        selectedMethod={paymentMethod}
        totalAmount={reservation.totalAmount}
        depositPercentage={reservation.activity.paymentSettings.depositPercentage}
        onSelect={setPaymentMethod}
      />

      {paymentMethod !== 'onsite' && (
        <div className="p-4 border rounded-lg bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={(!stripe && paymentMethod !== 'onsite') || processing}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {processing ? 'Traitement...' : paymentMethod === 'onsite' 
          ? 'Confirmer la réservation'
          : `Payer ${paymentMethod === 'deposit' 
              ? `${(reservation.totalAmount * reservation.activity.paymentSettings.depositPercentage) / 100}€`
              : `${reservation.totalAmount}€`}`
        }
      </button>
    </form>
  );
};

export default PaymentForm;
