import React, { useState, useEffect } from 'react';
import { Activity } from '../../../types/business/Activity';
import { Category } from '../../../types/business/Category';
import { activityService } from '../../../services/activityService';
import { categoryService } from '../../../services/categoryService';
import { FiEdit2, FiTrash2, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

interface ActivitiesTabProps {
  selectedCategoryId?: string | null;
  onActivitySelect?: (activityId: string) => void;
  onEditActivity?: (activity: Activity) => void;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  selectedCategoryId,
  onActivitySelect,
  onEditActivity,
}) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [activitiesData, categoriesData] = await Promise.all([
          activityService.getAll(),
          categoryService.getAll(),
        ]);
        setActivities(activitiesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    const handleActivityCreated = (event: CustomEvent<Activity>) => {
      setActivities(prevActivities => [...prevActivities, event.detail]);
    };

    const handleActivityUpdated = (event: CustomEvent<Activity>) => {
      setActivities(prevActivities => 
        prevActivities.map(activity => 
          activity.id === event.detail.id ? event.detail : activity
        )
      );
    };

    window.addEventListener('activityCreated', handleActivityCreated as EventListener);
    window.addEventListener('activityUpdated', handleActivityUpdated as EventListener);

    return () => {
      window.removeEventListener('activityCreated', handleActivityCreated as EventListener);
      window.removeEventListener('activityUpdated', handleActivityUpdated as EventListener);
    };
  }, []);

  const handleDeleteActivity = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      return;
    }

    try {
      await activityService.delete(id);
      setActivities(activities.filter(activity => activity.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'activité');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  const filteredActivities = selectedCategoryId
    ? activities.filter(activity => activity.categoryId === selectedCategoryId)
    : activities;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const category = categories.find(c => c.id === activity.categoryId);
              return (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.name}
                    </div>
                    <button
                      onClick={() => navigate(`/configuration/activities/${activity.id}/formulas`)}
                      className="text-sm text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mt-1"
                    >
                      Voir les formules
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {category.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Non catégorisé
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {activity.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onEditActivity?.(activity)}
                      className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-4"
                      title="Modifier l'activité"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer l'activité"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivitiesTab;
