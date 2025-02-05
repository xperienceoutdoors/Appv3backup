import React, { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiDownload, FiCalendar, FiFilter, FiSearch, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import { reservationService } from '../services/reservationService';
import { activityService } from '../services/activityService';
import { Reservation, ReservationStatus } from '../types/business/Reservation';
import ReservationDetailsModal from '../components/reservation/ReservationDetailsModal';
import { toast } from 'react-toastify';

const dateRanges = {
  today: {
    label: "Aujourd'hui",
    getRange: () => ({
      start: startOfDay(new Date()),
      end: endOfDay(new Date())
    })
  },
  week: {
    label: 'Cette semaine',
    getRange: () => ({
      start: startOfWeek(new Date(), { locale: fr }),
      end: endOfWeek(new Date(), { locale: fr })
    })
  },
  month: {
    label: 'Ce mois',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    })
  }
};

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée'
};

const statusColors: Record<ReservationStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' }
};

const SalesTracking: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Filtres
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedStatus, setSelectedStatus] = useState<ReservationStatus | ''>('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const loadedActivities = await activityService.getAll();
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
        toast.error('Erreur lors du chargement des activités');
      }
    };

    loadActivities();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0];
        filters.endDate = dateRange[1];
      }
      
      if (selectedStatus) {
        filters.status = selectedStatus;
      }
      
      if (selectedActivity) {
        filters.activityId = selectedActivity;
      }
      
      if (searchQuery) {
        filters.searchQuery = searchQuery;
      }

      const filtered = await reservationService.filter(filters);
      setReservations(filtered);

      if (dateRange[0] && dateRange[1]) {
        const stats = await reservationService.getStats(dateRange[0], dateRange[1]);
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [dateRange, selectedStatus, selectedActivity, searchQuery]);

  const handleExport = async () => {
    try {
      const csv = await reservationService.export();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting reservations:', error);
      toast.error('Erreur lors de l\'exportation');
    }
  };

  const handleQuickDateRange = (range: keyof typeof dateRanges) => {
    const { start, end } = dateRanges[range].getRange();
    setDateRange([start, end]);
  };

  const handleStatusChange = async (id: string, status: ReservationStatus) => {
    try {
      await reservationService.update(id, { status });
      toast.success('Statut mis à jour avec succès');
      loadReservations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-color)]">
          Suivi des ventes
        </h1>
        <button
          onClick={handleExport}
          className="button-secondary flex items-center"
        >
          <FiDownload className="w-5 h-5 mr-2" />
          Exporter
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre par date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période
            </label>
            <div className="flex flex-col space-y-2">
              <DatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={(update) => setDateRange(update)}
                className="input-primary w-full"
                placeholderText="Sélectionner une période"
              />
              <div className="flex flex-wrap gap-2">
                {Object.entries(dateRanges).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => handleQuickDateRange(key as keyof typeof dateRanges)}
                    className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filtre par statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ReservationStatus)}
              className="input-primary w-full"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par activité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activité
            </label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="input-primary w-full"
            >
              <option value="">Toutes les activités</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, email, ID..."
                className="input-primary w-full pl-10"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Total réservations</div>
            <div className="text-2xl font-bold text-[var(--primary-color)]">
              {stats.total}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Confirmées</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.confirmed}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">En attente</div>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Annulées</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.cancelled}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="text-sm text-gray-500">Chiffre d'affaires</div>
            <div className="text-2xl font-bold text-[var(--primary-color)]">
              {stats.totalRevenue.toFixed(2)} €
            </div>
          </div>
        </div>
      )}

      {/* Liste des réservations */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de l'activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucune réservation trouvée
                  </td>
                </tr>
              ) : (
                reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.customer.firstName} {reservation.customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {reservation.activity.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.activity.formula.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(reservation.activityDate), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.totalPrice.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value as ReservationStatus)}
                        className={`text-sm font-medium rounded-full px-2.5 py-0.5 ${
                          statusColors[reservation.status].bg
                        } ${statusColors[reservation.status].text} border-0`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                        title="Voir les détails"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedReservation && (
        <ReservationDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedReservation(null);
          }}
          reservation={selectedReservation}
          onUpdate={loadReservations}
        />
      )}
    </div>
  );
};

export default SalesTracking;
