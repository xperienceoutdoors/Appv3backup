import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiUserPlus } from 'react-icons/fi';
import { Customer } from '../types/business/Customer';
import customerService from '../services/customerService';
import CustomerModal from '../components/customer/CustomerModal';
import CustomerDetailsModal from '../components/customer/CustomerDetailsModal';
import { toast } from 'react-toastify';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | ''>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'lastReservation' | 'totalSpent'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const filtered = await customerService.filter({
        searchQuery,
        status: selectedStatus || undefined,
        sortBy,
        sortOrder
      });
      setCustomers(filtered);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery, selectedStatus, sortBy, sortOrder]);

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le client ${customer.firstName} ${customer.lastName} ?`)) {
      try {
        await customerService.delete(customer.id);
        toast.success('Client supprimé avec succès');
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
        toast.error('Erreur lors de la suppression du client');
      }
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-color)]">
          Fichier Client
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="button-primary flex items-center"
        >
          <FiUserPlus className="w-5 h-5 mr-2" />
          Nouveau Client
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recherche */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un client..."
              className="input-primary w-full pl-10"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filtre par statut */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'active' | 'inactive' | '')}
            className="input-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>

          {/* Tri */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="input-primary flex-1"
            >
              <option value="name">Nom</option>
              <option value="createdAt">Date d'inscription</option>
              <option value="lastReservation">Dernière réservation</option>
              <option value="totalSpent">Total dépensé</option>
            </select>
            <button
              onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              className="button-secondary px-3"
              title={sortOrder === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des clients */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière réservation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total dépensé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Client depuis {format(new Date(customer.createdAt), 'PP', { locale: fr })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.contact.email}</div>
                      <div className="text-sm text-gray-500">{customer.contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          customer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.stats.lastReservation
                        ? format(new Date(customer.stats.lastReservation), 'PP', { locale: fr })
                        : 'Aucune'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.stats.totalSpent.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsDetailsModalOpen(true);
                        }}
                        className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                        title="Voir les détails"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsCreateModalOpen(true);
                        }}
                        className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                        title="Modifier"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CustomerModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onSave={loadCustomers}
      />

      {selectedCustomer && (
        <CustomerDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedCustomer(null);
          }}
          customer={selectedCustomer}
          onUpdate={loadCustomers}
        />
      )}
    </div>
  );
};

export default Customers;
