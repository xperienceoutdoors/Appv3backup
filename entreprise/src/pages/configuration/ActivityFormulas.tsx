import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { activityService } from '../../services/activityService';
import { Activity } from '../../types/business/Activity';
import { toast } from 'react-toastify';

const ActivityFormulas: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) return;
      
      try {
        setIsLoading(true);
        const data = await activityService.get(activityId);
        if (!data) {
          throw new Error('Activité non trouvée');
        }
        setActivity(data);
      } catch (error) {
        console.error('Error loading activity:', error);
        toast.error('Erreur lors du chargement de l\'activité');
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [activityId]);

  const handleDeleteFormula = async (formulaId: string) => {
    if (!activity || !window.confirm('Êtes-vous sûr de vouloir supprimer cette formule ?')) {
      return;
    }

    try {
      const updatedFormulas = (activity.formulas || []).filter((f) => f.id !== formulaId);
      await activityService.update(activity.id, {
        ...activity,
        formulas: updatedFormulas,
      });

      setActivity({
        ...activity,
        formulas: updatedFormulas,
      });

      toast.success('Formule supprimée avec succès');
    } catch (error) {
      console.error('Error deleting formula:', error);
      toast.error('Erreur lors de la suppression de la formule');
    }
  };

  const getLowestPrice = (formula: Activity['formulas'][0]) => {
    if (!formula.rates || formula.rates.length === 0) return 0;
    return Math.min(...formula.rates.map(rate => rate.price));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/configuration/activities')}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            {activity ? `Formules - ${activity.name}` : 'Chargement...'}
          </h1>
        </div>
        <button
          onClick={() => navigate(`/configuration/activities/${activityId}/formulas/new`)}
          className="button-primary flex items-center"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Nouvelle formule
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : activity ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
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
                    Prix de base
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!activity.formulas || activity.formulas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Aucune formule disponible
                    </td>
                  </tr>
                ) : (
                  activity.formulas.map((formula) => (
                    <tr key={formula.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formula.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {formula.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getLowestPrice(formula).toFixed(2)} €
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/configuration/activities/${activityId}/formulas/${formula.id}`)}
                          className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteFormula(formula.id)}
                          className="text-red-600 hover:text-red-900"
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
        ) : (
          <div className="text-center text-gray-500">
            Erreur lors du chargement de l'activité
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFormulas;
