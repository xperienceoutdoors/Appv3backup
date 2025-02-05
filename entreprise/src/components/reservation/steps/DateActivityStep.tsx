import React, { useState, useEffect } from 'react';
import { ReservationData } from '../ReservationModal';
import '../CustomCalendar.css';
import { Activity } from '../../../types/business/Activity';
import RealTimeAvailabilityCalendar from '../RealTimeAvailabilityCalendar';
import { AvailableTimeSlot } from '../../../services/realTimeAvailabilityService';
import { activityService } from '../../../services/activityService';
import availabilityService from '../../../services/availabilityService';
import { periodService } from '../../../services/periodService';

interface DateActivityStepProps {
  data: ReservationData;
  onUpdate: (data: Partial<ReservationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DateActivityStep: React.FC<DateActivityStepProps> = ({ data, onUpdate, onNext }) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    data.date ? new Date(data.date).toISOString().split('T')[0] : ''
  );
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    data.activity ? data.activity : null
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableTimeSlot | null>(null);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les activités disponibles pour la date sélectionnée
  useEffect(() => {
    if (selectedDate) {
      loadActivitiesForDate(selectedDate);
    }
  }, [selectedDate]);

  const loadActivitiesForDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les périodes
      const periods = await periodService.getAll();
      console.log('Périodes disponibles:', periods);
      
      // Récupérer toutes les activités
      const allActivities = await activityService.getAll();
      console.log('Données brutes du localStorage:', localStorage.getItem('activities'));
      console.log('Toutes les activités:', allActivities);
      
      if (allActivities.length === 0) {
        setError('Aucune activité n\'est disponible. Veuillez contacter l\'administrateur.');
        return;
      }
      
      const activeActivities = allActivities.filter(a => a.isActive);
      console.log('Activités actives:', activeActivities);
      console.log('Détails des activités actives:', activeActivities.map(a => ({
        nom: a.name,
        active: a.isActive,
        ressources: a.resources,
        formules: a.formulas
      })));
      
      // Vérifier la disponibilité pour chaque activité à cette date
      const availableActs = await Promise.all(
        activeActivities.map(async (activity) => {
          try {
            console.log(`Vérification de la disponibilité pour ${activity.name}...`);
            // On vérifie la disponibilité pour toute la journée (9h-18h par défaut)
            const availability = await availabilityService.checkActivityAvailability(
              activity,
              new Date(date),
              '09:00', // heure de début par défaut
              '18:00', // heure de fin par défaut
              1 // Vérifie pour un participant minimum
            );
            console.log(`Résultat pour ${activity.name}:`, availability);
            if (availability.isAvailable) {
              return activity;
            } else {
              console.log(`${activity.name} n'est pas disponible. Conflits:`, availability.conflicts);
            }
          } catch (err) {
            console.error(`Erreur lors de la vérification de la disponibilité pour ${activity.name}:`, err);
          }
          return null;
        })
      );

      // Filtrer les activités non disponibles
      const filteredActivities = availableActs.filter((a): a is Activity => a !== null);
      
      if (filteredActivities.length === 0) {
        setError('Aucune activité n\'est disponible à cette date. Veuillez choisir une autre date.');
        return;
      }
      
      setAvailableActivities(filteredActivities);
    } catch (err) {
      console.error('Erreur lors du chargement des activités:', err);
      setError('Une erreur est survenue lors du chargement des activités. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedActivity(null);
    setSelectedSlot(null);
    onUpdate({ date: new Date(date) });
  };

  const handleActivitySelect = async (activity: Activity) => {
    setSelectedActivity(activity);
    setSelectedSlot(null);
    
    onUpdate({
      activity: {
        id: activity.id,
        name: activity.name
      }
    });

    // Passer automatiquement à l'étape suivante quand une activité est sélectionnée
    onNext();
  };

  const handleSlotSelect = (slot: AvailableTimeSlot, date: string) => {
    setSelectedSlot(slot);
    
    onUpdate({
      timeSlot: slot.startTime,
      price: slot.price
    });
  };

  const handleNext = () => {
    if (selectedActivity && selectedDate && selectedSlot) {
      onNext();
    }
  };

  return (
    <div className="date-activity-step">
      {/* Sélection de la date */}
      <div className="date-selection">
        <h3 className="text-lg font-medium mb-4">Choisissez une date</h3>
        <RealTimeAvailabilityCalendar
          activityId={selectedActivity?.id}
          onSlotSelect={handleSlotSelect}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot || undefined}
          onDateSelect={handleDateSelect}
          showOnlyDates={!selectedActivity} // Nouveau prop pour n'afficher que les dates disponibles
        />
      </div>

      {/* Liste des activités disponibles pour la date sélectionnée */}
      {selectedDate && (
        <div className="activity-selection mt-8">
          <h3 className="text-lg font-medium mb-4">
            Activités disponibles pour le {new Date(selectedDate).toLocaleDateString('fr-FR')}
          </h3>
          
          {loading ? (
            <div className="loading">Chargement des activités...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : availableActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune activité disponible à cette date
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`activity-card ${
                    selectedActivity?.id === activity.id ? 'selected' : ''
                  }`}
                  onClick={() => handleActivitySelect(activity)}
                >
                  {activity.imageUrl && (
                    <img
                      src={activity.imageUrl}
                      alt={activity.name}
                      className="w-full h-32 object-cover rounded-t"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-medium">{activity.name}</h4>
                    <p className="text-sm text-gray-600">{activity.shortDescription}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-accent-color font-medium">
                        À partir de {activity.pricing.basePrice}€
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Créneaux horaires (affichés uniquement après sélection de l'activité) */}
      {selectedActivity && selectedDate && (
        <div className="time-slots mt-8">
          <h3 className="text-lg font-medium mb-4">Créneaux horaires disponibles</h3>
          <RealTimeAvailabilityCalendar
            activityId={selectedActivity.id}
            onSlotSelect={handleSlotSelect}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot || undefined}
            showOnlyTimeSlots={true} // Nouveau prop pour n'afficher que les créneaux
          />
        </div>
      )}

      {/* Bouton suivant */}
      <div className="mt-8 flex justify-end">
        <button
          className={`px-6 py-2 rounded-md ${
            selectedActivity && selectedDate && selectedSlot
              ? 'bg-accent-color text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={handleNext}
          disabled={!selectedActivity || !selectedDate || !selectedSlot}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default DateActivityStep;
