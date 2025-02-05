import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity } from '../../types/business/Activity';
import { activityService } from '../../services/activityService';
import { FiPlus, FiEdit2, FiList } from 'react-icons/fi';

const CategoryActivities: React.FC = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      if (!categoryId) return;
      
      try {
        setIsLoading(true);
        const allActivities = await activityService.getAll();
        const categoryActivities = allActivities.filter(
          activity => activity.categoryId === categoryId
        );
        setActivities(categoryActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [categoryId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {activity.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/configuration/activities/${activity.id}/edit`)}
                    className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)] mr-3"
                  >
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/configuration/activities/${activity.id}/formulas`)}
                    className="text-[var(--primary-color)] hover:text-[var(--primary-color-dark)]"
                  >
                    <FiList className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryActivities;
