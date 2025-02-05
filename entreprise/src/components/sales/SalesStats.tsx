import React from 'react';
import { Reservation } from '../../types/business/Reservation';

interface SalesStatsProps {
  reservations: Reservation[];
}

const SalesStats: React.FC<SalesStatsProps> = ({ reservations }) => {
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmée').length,
    pending: reservations.filter(r => r.status === 'en attente').length,
    cancelled: reservations.filter(r => r.status === 'annulée').length,
    totalAmount: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
    averageAmount: reservations.length > 0
      ? reservations.reduce((sum, r) => sum + r.totalAmount, 0) / reservations.length
      : 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Total Réservations"
        value={stats.total}
        color="text-gray-900"
      />
      <StatCard
        title="Confirmées"
        value={stats.confirmed}
        color="text-green-600"
      />
      <StatCard
        title="En Attente"
        value={stats.pending}
        color="text-yellow-600"
      />
      <StatCard
        title="Annulées"
        value={stats.cancelled}
        color="text-red-600"
      />
      <StatCard
        title="Montant Total"
        value={formatCurrency(stats.totalAmount)}
        color="text-primary-600"
      />
      <StatCard
        title="Panier Moyen"
        value={formatCurrency(stats.averageAmount)}
        color="text-primary-600"
      />
    </div>
  );
};

export default SalesStats;
