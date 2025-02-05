import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Resource } from '../../types/business/Resource';
import { Activity } from '../../types/business/Activity';
import resourceService from '../../services/resourceService';
import { activityService } from '../../services/activityService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

interface ReservationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEditing?: boolean;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues: initialData || {}
  });

  // Charger les activités au montage du composant
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const loadedActivities = await activityService.getAll();
        setActivities(loadedActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error loading activities:', error);
        toast.error('Erreur lors du chargement des activités');
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Mettre à jour les ressources disponibles lorsque l'activité ou les dates changent
  useEffect(() => {
    const updateAvailableResources = async () => {
      if (!selectedActivity || !startDate || !endDate) return;

      try {
        const resources = await resourceService.getAvailableResources(
          new Date(startDate),
          new Date(endDate),
          selectedActivity
        );
        setAvailableResources(resources);
      } catch (error) {
        console.error('Error loading available resources:', error);
        toast.error('Erreur lors du chargement des ressources disponibles');
      }
    };

    updateAvailableResources();
  }, [selectedActivity, startDate, endDate]);

  // Gestionnaire de changement d'activité
  const handleActivityChange = (activityId: string) => {
    setSelectedActivity(activityId);
    // Réinitialiser les ressources sélectionnées car elles peuvent ne plus être pertinentes
    setValue('resources', []);
  };

  // Gestionnaire de changement de dates
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    if (field === 'startDate') {
      setStartDate(value);
      // Si la date de fin est avant la nouvelle date de début, la mettre à jour
      if (endDate && new Date(endDate) < new Date(value)) {
        setEndDate(value);
        setValue('endDate', value);
      }
    } else {
      setEndDate(value);
    }
  };

  const onFormSubmit = async (data: any) => {
    // Vérifier une dernière fois les disponibilités avant de soumettre
    for (const resource of data.resources || []) {
      const availableQuantity = await resourceService.getAvailableQuantity(
        resource.id,
        new Date(data.startDate),
        new Date(data.endDate)
      );

      if (resource.quantity > availableQuantity) {
        toast.error(`La ressource ${resource.name} n'est plus disponible en quantité suffisante`);
        return;
      }
    }

    onSubmit(data);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Sélection de l'activité */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Activité
        </label>
        <select
          {...register('activityId')}
          onChange={(e) => handleActivityChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          disabled={isEditing}
        >
          <option value="">Sélectionnez une activité</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection des dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de début
          </label>
          <input
            type="datetime-local"
            {...register('startDate')}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de fin
          </label>
          <input
            type="datetime-local"
            {...register('endDate')}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            min={startDate}
          />
        </div>
      </div>

      {/* Sélection des ressources */}
      {availableResources.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ressources disponibles
          </h3>
          <div className="space-y-4">
            {availableResources.map((resource) => (
              <div key={resource.id} className="flex items-center space-x-4">
                <div className="flex-grow">
                  <label className="block text-sm font-medium text-gray-700">
                    {resource.name}
                  </label>
                  <p className="text-sm text-gray-500">
                    Disponible: {resource.totalQuantity} {resource.unit}
                  </p>
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    {...register(`resources.${resource.id}`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    min="0"
                    max={resource.totalQuantity}
                    placeholder="Quantité"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isEditing ? 'Mettre à jour' : 'Réserver'}
        </button>
      </div>
    </form>
  );
};

export default ReservationForm;
