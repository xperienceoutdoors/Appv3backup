import React, { useState } from 'react';
import { ReservationData } from '../ReservationModal';
import { reservationService } from '../../../services/reservationService';
import { toast } from 'react-toastify';

interface ConfirmationStepProps {
  data: ReservationData;
  onUpdate: (data: Partial<ReservationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ data, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirmation = async () => {
    setIsSaving(true);
    try {
      // Convertir les données au format attendu par le service
      const reservationData = {
        customer: {
          firstName: data.customer?.firstName || '',
          lastName: data.customer?.lastName || '',
          email: data.customer?.email || '',
          phone: data.customer?.phone || ''
        },
        activity: {
          id: data.activity?.id || '',
          name: data.activity?.name || '',
          formula: {
            id: data.formulas?.[0]?.id || '',
            name: data.formulas?.[0]?.name || '',
            duration: 0 // À adapter selon vos besoins
          },
          timeSlot: {
            startTime: data.timeSlot || new Date().toISOString(),
            endTime: data.timeSlot || new Date().toISOString()
          }
        },
        options: (data.options || []).map(opt => ({
          id: opt.id,
          name: opt.name,
          price: 0, // À récupérer depuis le service d'options
          quantity: opt.quantity,
          unit: 'unité' // À adapter selon vos besoins
        })),
        status: 'pending' as const,
        totalPrice: data.payment?.amount || 0,
        activityDate: data.date?.toISOString() || new Date().toISOString(),
        paymentStatus: 'pending' as const,
        paymentMethod: data.payment?.method
      };

      await reservationService.create(reservationData);
      toast.success('Réservation créée avec succès !');
      onNext();
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Erreur lors de la création de la réservation');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Message de confirmation */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-color)] bg-opacity-20 
                      flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[var(--accent-color)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary-color)] mb-2">
          Réservation confirmée !
        </h2>
        <p className="text-[var(--primary-color)] text-opacity-70">
          Un email de confirmation a été envoyé à {data.customer?.email}
        </p>
      </div>

      {/* Détails de la réservation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4">
          Récapitulatif de votre réservation
        </h3>

        <div className="space-y-4">
          {/* Activité */}
          <div>
            <h4 className="font-medium text-[var(--primary-color)]">Activité</h4>
            <p className="text-[var(--primary-color)] text-opacity-70">
              {data.activity?.name}
            </p>
          </div>

          {/* Date et horaire */}
          {data.date && (
            <div>
              <h4 className="font-medium text-[var(--primary-color)]">
                Date et horaire
              </h4>
              <p className="text-[var(--primary-color)] text-opacity-70">
                {formatDate(data.date)} à {data.timeSlot}
              </p>
            </div>
          )}

          {/* Formules */}
          {data.formulas && data.formulas.length > 0 && (
            <div>
              <h4 className="font-medium text-[var(--primary-color)]">Formule</h4>
              <ul className="list-disc list-inside text-[var(--primary-color)] text-opacity-70">
                {data.formulas.map((formula) => (
                  <li key={formula.id}>
                    {formula.name} (x{formula.quantity})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Options */}
          {data.options && data.options.length > 0 && (
            <div>
              <h4 className="font-medium text-[var(--primary-color)]">Options</h4>
              <ul className="list-disc list-inside text-[var(--primary-color)] text-opacity-70">
                {data.options.map((option) => (
                  <li key={option.id}>
                    {option.name} (x{option.quantity})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Informations client */}
          {data.customer && (
            <div>
              <h4 className="font-medium text-[var(--primary-color)]">
                Informations client
              </h4>
              <div className="text-[var(--primary-color)] text-opacity-70">
                <p>
                  {data.customer.firstName} {data.customer.lastName}
                </p>
                <p>{data.customer.email}</p>
                <p>{data.customer.phone}</p>
              </div>
            </div>
          )}

          {/* Paiement */}
          {data.payment && (
            <div>
              <h4 className="font-medium text-[var(--primary-color)]">Paiement</h4>
              <p className="text-[var(--primary-color)] text-opacity-70">
                {data.payment.method} - {data.payment.amount} €
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleConfirmation}
          disabled={isSaving}
          className="button-primary"
        >
          {isSaving ? 'Confirmation en cours...' : 'Confirmer la réservation'}
        </button>
      </div>

      {/* Instructions */}
      <div className="card bg-[var(--primary-color)] bg-opacity-5">
        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4">
          Prochaines étapes
        </h3>
        <ul className="space-y-2 text-[var(--primary-color)]">
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[var(--accent-color)] mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span>
              Présentez-vous 15 minutes avant le début de votre activité
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[var(--accent-color)] mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span>
              Apportez une tenue adaptée et une serviette
            </span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-[var(--accent-color)] mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span>
              En cas d'empêchement, contactez-nous au moins 24h à l'avance
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConfirmationStep;
