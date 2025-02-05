import React from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Dialog } from '@headlessui/react';
import { FiX, FiClock, FiCalendar, FiUser, FiMail, FiPhone, FiTag } from 'react-icons/fi';
import { Reservation } from '../../types/business/Reservation';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onUpdate: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onUpdate
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex justify-between items-center p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-[var(--primary-color)]">
              Détails de la réservation
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            {/* Informations principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informations client
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <FiUser className="w-5 h-5 mr-2" />
                    <span>
                      {reservation.customer.firstName} {reservation.customer.lastName}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiMail className="w-5 h-5 mr-2" />
                    <a
                      href={`mailto:${reservation.customer.email}`}
                      className="text-[var(--primary-color)] hover:underline"
                    >
                      {reservation.customer.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiPhone className="w-5 h-5 mr-2" />
                    <a
                      href={`tel:${reservation.customer.phone}`}
                      className="text-[var(--primary-color)] hover:underline"
                    >
                      {reservation.customer.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Détails de l'activité
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <FiTag className="w-5 h-5 mr-2" />
                    <span>{reservation.activity.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiClock className="w-5 h-5 mr-2" />
                    <span>{reservation.activity.formula.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="w-5 h-5 mr-2" />
                    <span>
                      {format(parseISO(reservation.activityDate), 'PPPP', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Options */}
            {reservation.options.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Options sélectionnées
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {reservation.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium text-gray-900">
                            {option.name}
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            ({option.quantity} {option.unit})
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {(option.price * option.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total</span>
                        <span>{reservation.totalPrice.toFixed(2)} €</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Historique */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Historique
              </h3>
              <div className="space-y-4">
                {reservation.history.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--primary-color)] mt-2" />
                    <div>
                      <div className="text-sm text-gray-500">
                        {format(parseISO(event.date), 'dd/MM/yyyy HH:mm')}
                      </div>
                      <div className="text-gray-900">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ReservationDetailsModal;
