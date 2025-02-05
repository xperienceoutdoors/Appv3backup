import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Reservation, ReservationStatus } from '../../types/business/Reservation';
import { ReservationPayment } from '../../types/business/ReservationPayment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { reservationService } from '../../services/reservationService';
import emailService from '../../services/emailService';
import { generatePDF } from '../../utils/pdfGenerator';
import NotesSection from './NotesSection';
import PaymentDetails from './PaymentDetails';
import ModificationHistory from './ModificationHistory';

interface ReservationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation;
  onReservationUpdated: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  isOpen,
  onClose,
  reservation,
  onReservationUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<ReservationPayment>>({
    method: 'carte',
    amount: 0,
    status: 'en attente'
  });

  const handleSendConfirmation = async () => {
    try {
      await emailService.sendReservationConfirmation(reservation);
      toast.success('Email de confirmation envoyé');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const pdfBlob = await generatePDF(reservation);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${reservation.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération de la facture:', error);
      toast.error('Erreur lors de la génération de la facture');
    }
  };

  const handleCancelReservation = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      setIsCancelling(true);
      await reservationService.cancel(reservation.id);
      toast.success('Réservation annulée');
      onReservationUpdated();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      const payment: ReservationPayment = {
        id: crypto.randomUUID(),
        date: new Date(),
        ...newPayment as Omit<ReservationPayment, 'id' | 'date'>
      };

      const updatedReservation = {
        ...reservation,
        payments: [...(reservation.payments || []), payment]
      };

      await reservationService.update(reservation.id, updatedReservation);
      toast.success('Paiement ajouté');
      setIsAddingPayment(false);
      setNewPayment({ method: 'carte', amount: 0, status: 'en attente' });
      onReservationUpdated();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement:', error);
      toast.error('Erreur lors de l\'ajout du paiement');
    }
  };

  const handleSaveNotes = async (notes: string) => {
    try {
      await reservationService.updateNotes(reservation.id, notes);
      toast.success('Notes mises à jour');
      onReservationUpdated();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes:', error);
      toast.error('Erreur lors de la mise à jour des notes');
    }
  };

  const remainingAmount = reservation.totalAmount - 
    (reservation.payments?.reduce((sum, p) => sum + p.amount, 0) || 0);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <div className="relative bg-white rounded-xl max-w-4xl w-full mx-auto p-6">
          {/* En-tête */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <Dialog.Title className="text-2xl font-semibold text-gray-900">
                Détails de la Réservation
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-500">
                #{reservation.id} - Créée le {format(new Date(reservation.createdAt), 'Pp', { locale: fr })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Fermer</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Informations client */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Client</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="text-sm text-gray-900">
                    {reservation.customer.firstName} {reservation.customer.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{reservation.customer.email}</dd>
                </div>
                {reservation.customer.phone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                    <dd className="text-sm text-gray-900">{reservation.customer.phone}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Détails de l'activité */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activité</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Activité</dt>
                  <dd className="text-sm text-gray-900">{reservation.activity.name}</dd>
                </div>
                {reservation.formula && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Formule</dt>
                    <dd className="text-sm text-gray-900">{reservation.formula.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(reservation.startDate), 'PPP', { locale: fr })}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Heure</dt>
                  <dd className="text-sm text-gray-900">
                    {format(new Date(reservation.startDate), 'HH:mm')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Statut et actions principales */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-500">Statut:</span>
                <span className={`px-2 py-1 text-sm font-semibold rounded-full ${
                  reservation.status === 'confirmée' ? 'bg-green-100 text-green-800' :
                  reservation.status === 'en attente' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {reservation.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSendConfirmation}
                  className="btn btn-secondary"
                  disabled={reservation.status === 'annulée'}
                >
                  Envoyer confirmation
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="btn btn-secondary"
                >
                  Télécharger facture
                </button>
                <button
                  onClick={handleCancelReservation}
                  className="btn btn-danger"
                  disabled={reservation.status === 'annulée' || isCancelling}
                >
                  {isCancelling ? 'Annulation...' : 'Annuler'}
                </button>
              </div>
            </div>
          </div>

          {/* Paiements */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Paiements</h3>
              <button
                onClick={() => setIsAddingPayment(true)}
                className="btn btn-primary"
                disabled={remainingAmount <= 0}
              >
                Ajouter un paiement
              </button>
            </div>

            {isAddingPayment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Méthode
                    </label>
                    <select
                      value={newPayment.method}
                      onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as ReservationPayment['method'] })}
                      className="w-full rounded-md border-gray-300"
                    >
                      <option value="carte">Carte bancaire</option>
                      <option value="espèces">Espèces</option>
                      <option value="virement">Virement</option>
                      <option value="chèque">Chèque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Montant
                    </label>
                    <input
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                      max={remainingAmount}
                      className="w-full rounded-md border-gray-300"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddPayment}
                      className="btn btn-primary w-full"
                      disabled={!newPayment.amount || newPayment.amount <= 0 || newPayment.amount > remainingAmount}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}

            <PaymentDetails
              payments={reservation.payments || []}
              totalAmount={reservation.totalAmount}
            />
          </div>

          {/* Notes et historique */}
          <div className="grid grid-cols-2 gap-6">
            <NotesSection
              notes={reservation.notes || ''}
              onSave={handleSaveNotes}
            />
            <ModificationHistory
              history={reservation.modificationHistory || []}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ReservationDetailsModal;
