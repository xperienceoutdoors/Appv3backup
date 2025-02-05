import React, { useState, useEffect } from "react";
import optionalSaleService from "../../services/optionalSaleService";
import OptionalSaleModal from "../../components/optionalSales/OptionalSaleModal";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from 'react-toastify';

const OptionalSales: React.FC = () => {
  const [optionalSales, setOptionalSales] = useState<OptionalSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<OptionalSale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOptionalSales();
  }, []);

  const loadOptionalSales = async () => {
    try {
      const sales = await optionalSaleService.getAll();
      setOptionalSales(sales);
    } catch (error) {
      console.error('Error loading optional sales:', error);
      toast.error('Erreur lors du chargement des ventes additionnelles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente additionnelle ?')) {
      try {
        await optionalSaleService.delete(id);
        toast.success('Vente additionnelle supprimée avec succès');
        loadOptionalSales();
      } catch (error) {
        console.error('Error deleting optional sale:', error);
        toast.error('Erreur lors de la suppression de la vente additionnelle');
      }
    }
  };

  const handleCreate = () => {
    setSelectedSale(null);
    setIsModalOpen(true);
  };

  const handleEdit = (sale: OptionalSale) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleSave = async (sale: OptionalSale) => {
    try {
      if (selectedSale) {
        await optionalSaleService.update(selectedSale.id, sale);
        toast.success('Vente additionnelle mise à jour avec succès');
      } else {
        await optionalSaleService.create(sale);
        toast.success('Vente additionnelle créée avec succès');
      }
      loadOptionalSales();
    } catch (error) {
      console.error('Error saving optional sale:', error);
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--primary-color)]">
          Ventes Additionnelles
        </h1>
        <button
          onClick={handleCreate}
          className="button-primary flex items-center"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Nouvelle Vente
        </button>
      </div>

      {optionalSales.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucune vente additionnelle configurée</p>
          <button
            onClick={handleCreate}
            className="mt-4 button-secondary"
          >
            Créer une vente additionnelle
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unité
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
              {optionalSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{sale.name}</div>
                      {sale.description && (
                        <div className="text-sm text-gray-500">{sale.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {sale.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {sale.price.toFixed(2)} €
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {sale.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sale.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sale.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                      title="Modifier"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OptionalSaleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
        onSave={handleSave}
      />
    </div>
  );
};

export default OptionalSales;
