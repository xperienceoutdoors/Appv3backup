import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus } from '../../types/business/Reservation';
import { reservationService } from '../../services/reservationService';
import ReservationDetailsModal from '../../components/sales/ReservationDetailsModal';
import SalesFilters from '../../components/sales/SalesFilters';
import SalesStats from '../../components/sales/SalesStats';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-toastify';

const SalesTracking: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: undefined as ReservationStatus | undefined,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    searchQuery: undefined as string | undefined
  });

  useEffect(() => {
    loadReservations();
  }, []);

  useEffect(() => {
    filterReservations();
  }, [reservations, filters]);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getAll();
      setReservations(data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      toast.error('Erreur lors du chargement des réservations');
      setLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => new Date(r.startDate) >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => new Date(r.startDate) <= filters.endDate!);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.customer.firstName.toLowerCase().includes(query) ||
        r.customer.lastName.toLowerCase().includes(query) ||
        r.customer.email.toLowerCase().includes(query) ||
        r.activity.name.toLowerCase().includes(query)
      );
    }

    setFilteredReservations(filtered);
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReservation(null);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmée':
        return 'bg-green-100 text-green-800';
      case 'en attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'annulée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        console.error('Date invalide:', dateString);
        return 'Date invalide';
      }
      return format(date, 'PPP', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return 'Date invalide';
    }
  };

  const formatTime = (dateString: string | Date) => {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        console.error('Date invalide:', dateString);
        return '--:--';
      }
      return format(date, 'HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de l\'heure:', error);
      return '--:--';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--primary-color)]">Suivi des Ventes</h1>
      </div>

      <SalesStats reservations={filteredReservations} />
      <SalesFilters onFilterChange={handleFilterChange} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activité
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {reservation.customer.firstName} {reservation.customer.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{reservation.customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.activity.name}</div>
                    <div className="text-sm text-gray-500">{reservation.formula?.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(reservation.startDate)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(reservation.startDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(reservation.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(reservation)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Voir les détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReservation && (
        <ReservationDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          reservation={selectedReservation}
          onReservationUpdated={loadReservations}
        />
      )}
    </div>
  );
};

export default SalesTracking;
