import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Reservation } from '../../types/business/Reservation';
import StripeWrapper from './StripeWrapper';
import PaymentForm from './PaymentForm';
import { toast } from 'react-toastify';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
}

const PaymentModal = ({ isOpen, onClose, reservation }: PaymentModalProps) => {
  const handleSuccess = () => {
    toast.success('Paiement effectué avec succès');
    onClose();
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded bg-white p-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-medium">
              Paiement de la réservation
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Réservation pour {reservation.customer.firstName} {reservation.customer.lastName}
            </p>
            <p className="text-sm text-gray-500">
              {reservation.activity.name}
            </p>
            <p className="text-lg font-bold mt-2">
              Montant : {reservation.totalAmount}€
            </p>
          </div>

          <StripeWrapper>
            <PaymentForm
              reservation={reservation}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </StripeWrapper>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PaymentModal;
