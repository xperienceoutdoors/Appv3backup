import React from 'react';
import { ReservationStatus } from '../../types/business/Reservation';

interface SalesFiltersProps {
  onFilterChange: (filters: {
    status?: ReservationStatus;
    startDate?: Date;
    endDate?: Date;
    searchQuery?: string;
  }) => void;
}

const SalesFilters: React.FC<SalesFiltersProps> = ({ onFilterChange }) => {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as ReservationStatus | undefined;
    onFilterChange({ status: status === 'all' ? undefined : status as ReservationStatus });
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const date = value ? new Date(value) : undefined;
    onFilterChange({ [type === 'start' ? 'startDate' : 'endDate']: date });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ searchQuery: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Recherche */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Rechercher
          </label>
          <input
            type="text"
            id="search"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="Nom, email, activité..."
            onChange={handleSearchChange}
          />
        </div>

        {/* Filtre par statut */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            onChange={handleStatusChange}
            defaultValue="all"
          >
            <option value="all">Tous les statuts</option>
            <option value="en attente">En attente</option>
            <option value="confirmée">Confirmée</option>
            <option value="annulée">Annulée</option>
          </select>
        </div>

        {/* Date de début */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            onChange={(e) => handleDateChange('start', e.target.value)}
          />
        </div>

        {/* Date de fin */}
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="endDate"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            onChange={(e) => handleDateChange('end', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesFilters;
