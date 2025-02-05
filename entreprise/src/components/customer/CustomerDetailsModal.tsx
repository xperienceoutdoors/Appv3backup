import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from '../common/Modal';
import { Customer } from '../../types/business/Customer';
import { FiMail, FiPhone, FiCalendar, FiClock } from 'react-icons/fi';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onUpdate: () => void;
}

const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({
  isOpen,
  onClose,
  customer
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${customer.firstName} ${customer.lastName}`}
    >
      <div className="space-y-6">
        {/* Informations de contact */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-[var(--primary-color)] mb-4">
            Informations de contact
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiMail className="w-5 h-5 text-gray-400 mr-2" />
              <a
                href={`mailto:${customer.contact.email}`}
                className="text-[var(--primary-color)] hover:underline"
              >
                {customer.contact.email}
              </a>
            </div>
            <div className="flex items-center">
              <FiPhone className="w-5 h-5 text-gray-400 mr-2" />
              <a
                href={`tel:${customer.contact.phone}`}
                className="text-[var(--primary-color)] hover:underline"
              >
                {customer.contact.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total des réservations</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--primary-color)]">
              {customer.stats.totalReservations}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Total dépensé</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--primary-color)]">
              {customer.stats.totalSpent.toFixed(2)} €
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Panier moyen</div>
            <div className="mt-1 text-2xl font-semibold text-[var(--primary-color)]">
              {customer.stats.averageReservationValue.toFixed(2)} €
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Dernière réservation</div>
            <div className="mt-1 text-lg font-semibold text-[var(--primary-color)]">
              {customer.stats.lastReservation
                ? format(new Date(customer.stats.lastReservation), 'PP', { locale: fr })
                : 'Aucune'}
            </div>
          </div>
        </div>

        {/* Dates importantes */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-[var(--primary-color)] mb-4">
            Dates importantes
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <FiCalendar className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Client depuis</div>
                <div className="text-[var(--primary-color)]">
                  {format(new Date(customer.createdAt), 'PP', { locale: fr })}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <FiClock className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Dernière mise à jour</div>
                <div className="text-[var(--primary-color)]">
                  {format(new Date(customer.updatedAt), 'PP', { locale: fr })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {customer.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-[var(--primary-color)] mb-2">
              Notes
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">{customer.notes}</p>
          </div>
        )}

        {/* RGPD */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-[var(--primary-color)] mb-2">
            Préférences RGPD
          </h3>
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                customer.gdprConsent?.marketing
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-gray-700">
              {customer.gdprConsent?.marketing
                ? 'Accepte les communications marketing'
                : 'Ne souhaite pas recevoir de communications marketing'}
            </span>
          </div>
          {customer.gdprConsent?.dateAccepted && (
            <div className="mt-2 text-sm text-gray-500">
              Consentement donné le{' '}
              {format(new Date(customer.gdprConsent.dateAccepted), 'PP', {
                locale: fr,
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CustomerDetailsModal;
