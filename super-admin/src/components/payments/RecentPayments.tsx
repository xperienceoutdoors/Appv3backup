import React from 'react';
import { Payment } from '../../types';

interface RecentPaymentsProps {
  limit?: number;
}

const RecentPayments: React.FC<RecentPaymentsProps> = ({ limit }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Paiements Récents</h2>
        <button className="text-blue-600 hover:text-blue-800">
          Voir tout
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entreprise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Table rows will be populated with payment data */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPayments;
