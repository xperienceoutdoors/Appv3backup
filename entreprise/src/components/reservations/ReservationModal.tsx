import React from 'react';
import { Activity } from '../../types/business/Activity';
import ReservationForm from './ReservationForm';

interface ReservationModalProps {
  activity: Activity;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  activity,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    // Vous pouvez ajouter ici une notification de succès
  };

  const handleError = (error: string) => {
    // Vous pouvez ajouter ici une gestion des erreurs plus sophistiquée
    console.error(error);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Fermer</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-title"
              >
                Réserver {activity.name}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {activity.shortDescription}
                </p>
              </div>
              <div className="mt-4">
                <ReservationForm
                  activity={activity}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
