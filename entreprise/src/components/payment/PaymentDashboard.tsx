import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ReservationPayment } from '../../types/business/ReservationPayment';

interface PaymentStats {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  totalReservations: number;
  paidReservations: number;
  partiallyPaidReservations: number;
}

const PaymentDashboard = () => {
  const [recentPayments, setRecentPayments] = useState<ReservationPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0,
    totalReservations: 0,
    paidReservations: 0,
    partiallyPaidReservations: 0
  });

  useEffect(() => {
    // Charger les données depuis l'API
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Dans un cas réel, ces données viendraient de votre API
      const mockPayments = [
        {
          id: '1',
          amount: 50,
          method: 'carte',
          status: 'confirmé',
          date: new Date(),
          reference: 'pi_123'
        },
        {
          id: '2',
          amount: 30,
          method: 'carte',
          status: 'confirmé',
          date: new Date(),
          reference: 'pi_124'
        }
      ];

      const mockStats = {
        totalAmount: 1000,
        paidAmount: 800,
        pendingAmount: 200,
        totalReservations: 20,
        paidReservations: 15,
        partiallyPaidReservations: 3
      };

      setRecentPayments(mockPayments);
      setStats(mockStats);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900">Montants</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2">
            <div>
              <dt className="text-sm text-gray-500">Total</dt>
              <dd className="text-2xl font-semibold">{stats.totalAmount}€</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Payé</dt>
              <dd className="text-2xl font-semibold text-green-600">
                {stats.paidAmount}€
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">En attente</dt>
              <dd className="text-2xl font-semibold text-orange-600">
                {stats.pendingAmount}€
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900">Réservations</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2">
            <div>
              <dt className="text-sm text-gray-500">Total</dt>
              <dd className="text-2xl font-semibold">
                {stats.totalReservations}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Payées</dt>
              <dd className="text-2xl font-semibold text-green-600">
                {stats.paidReservations}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Partiellement payées</dt>
              <dd className="text-2xl font-semibold text-orange-600">
                {stats.partiallyPaidReservations}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
          <div className="mt-4 space-y-2">
            <Link
              to="/configuration/stripe"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              Paramètres Stripe
            </Link>
            <Link
              to="/configuration/activities"
              className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
            >
              Configurer les activités
            </Link>
          </div>
        </div>
      </div>

      {/* Paiements récents */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">
            Paiements récents
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {recentPayments.map((payment) => (
              <li key={payment.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {payment.amount}€ par {payment.method}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.date), 'PPP', { locale: fr })}
                    </p>
                  </div>
                  <div className="ml-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'confirmé'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;
