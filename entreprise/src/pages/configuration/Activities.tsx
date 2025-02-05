import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CategoriesTab from './tabs/CategoriesTab';
import ActivitiesTab from './tabs/ActivitiesTab';
import { FiPlus } from 'react-icons/fi';
import CategoryModal from '../../components/categories/CategoryModal';
import ActivityModal from '../../components/activities/ActivityModal';
import { categoryService } from '../../services/categoryService';
import { activityService } from '../../services/activityService';
import { Category } from '../../types/business/Category';
import { Activity } from '../../types/business/Activity';

const Activities: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEditActivity = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (activity: Activity) => {
    try {
      let savedActivity;
      if (selectedActivity) {
        savedActivity = await activityService.update(selectedActivity.id, activity);
        window.dispatchEvent(new CustomEvent('activityUpdated', { detail: savedActivity }));
      } else {
        savedActivity = await activityService.create(activity);
        window.dispatchEvent(new CustomEvent('activityCreated', { detail: savedActivity }));
      }
      setIsActivityModalOpen(false);
      setSelectedActivity(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'activité:', err);
      setError('Erreur lors de la sauvegarde de l\'activité');
    }
  };

  const handleSaveCategory = async (category: Category) => {
    try {
      await categoryService.create(category);
      setIsCategoryModalOpen(false);
    } catch (err) {
      console.error('Erreur lors de la création de la catégorie:', err);
      setError('Erreur lors de la création de la catégorie');
    }
  };

  const renderActions = () => {
    const currentPath = location.pathname;
    
    if (currentPath === '/configuration/activities' || currentPath === '/configuration/activities/list') {
      return (
        <button
          onClick={() => setIsActivityModalOpen(true)}
          className="button-primary flex items-center"
        >
          <FiPlus className="w-5 h-5 mr-1" />
          Nouvelle activité
        </button>
      );
    }
    
    if (currentPath === '/configuration/activities/categories') {
      return (
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="button-primary flex items-center"
        >
          <FiPlus className="w-5 h-5 mr-1" />
          Nouvelle catégorie
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Activités</h1>
        {renderActions()}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>
      )}

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/configuration/activities/list"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              (location.pathname === '/configuration/activities/list' || location.pathname === '/configuration/activities')
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activités
          </Link>
          <Link
            to="/configuration/activities/categories"
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              location.pathname === '/configuration/activities/categories'
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Catégories
          </Link>
        </nav>
      </div>

      <div className="mt-6">
        {(location.pathname === '/configuration/activities/list' || location.pathname === '/configuration/activities') && (
          <ActivitiesTab 
            onEditActivity={handleEditActivity}
          />
        )}
        {location.pathname === '/configuration/activities/categories' && (
          <CategoriesTab />
        )}
      </div>

      {isCategoryModalOpen && (
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          category={null}
        />
      )}

      {isActivityModalOpen && (
        <ActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => {
            setIsActivityModalOpen(false);
            setSelectedActivity(null);
          }}
          onSave={handleSaveActivity}
          activity={selectedActivity || undefined}
        />
      )}
    </div>
  );
};

export default Activities;
