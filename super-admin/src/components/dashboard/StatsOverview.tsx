import React from 'react';
import { DashboardStats } from '../../types';

const StatsOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total des entreprises */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm">Total Entreprises</div>
        <div className="text-2xl font-bold mt-2">0</div>
        <div className="text-green-500 text-sm mt-2">+0% depuis le mois dernier</div>
      </div>

      {/* Entreprises actives */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm">Entreprises Actives</div>
        <div className="text-2xl font-bold mt-2">0</div>
        <div className="text-green-500 text-sm mt-2">Taux d'activité: 0%</div>
      </div>

      {/* Revenu mensuel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm">Revenu Mensuel</div>
        <div className="text-2xl font-bold mt-2">0 €</div>
        <div className="text-green-500 text-sm mt-2">+0% depuis le mois dernier</div>
      </div>

      {/* Abonnements actifs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-gray-500 text-sm">Abonnements Actifs</div>
        <div className="text-2xl font-bold mt-2">0</div>
        <div className="text-yellow-500 text-sm mt-2">0 en période d'essai</div>
      </div>
    </div>
  );
};

export default StatsOverview;
