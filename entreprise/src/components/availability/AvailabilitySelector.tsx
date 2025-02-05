import React, { useEffect, useState } from 'react';
import { Activity } from '../../types/activity';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import availabilityService from '../../services/availabilityService';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface AvailabilitySelectorProps {
  activity: Activity;
  selectedDate: Date;
  requestedQuantity: number;
  onSlotSelect: (slot: { startTime: string; endTime: string }) => void;
}

export const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  activity,
  selectedDate,
  requestedQuantity,
  onSlotSelect,
}) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        // Générer tous les créneaux possibles pour la journée
        const slots: TimeSlot[] = [];
        const schedule = activity.schedule[selectedDate.getDay()];
        
        if (!schedule || !schedule.isActive) {
          setAvailableSlots([]);
          return;
        }

        const [startHour, startMinute] = schedule.openingTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.closingTime.split(':').map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        const step = 30; // minutes

        for (let time = startTime; time < endTime; time += step) {
          const currentStartTime = `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}`;
          const currentEndTime = activity.duration 
            ? availabilityService.calculateEndTime(currentStartTime, activity.duration.duration)
            : `${Math.floor((time + step) / 60)}:${String((time + step) % 60).padStart(2, '0')}`;

          // Vérifier la disponibilité pour ce créneau
          const availability = await availabilityService.checkActivityAvailability(
            activity,
            selectedDate,
            currentStartTime,
            currentEndTime,
            requestedQuantity
          );

          slots.push({
            startTime: currentStartTime,
            endTime: currentEndTime,
            isAvailable: availability.isAvailable
          });
        }

        setAvailableSlots(slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [activity, selectedDate, requestedQuantity]);

  if (loading) {
    return <div className="flex justify-center p-4">Chargement des disponibilités...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (availableSlots.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">
          Aucun créneau disponible pour {requestedQuantity} personne(s) à cette date.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Essayez une autre date ou réduisez le nombre de personnes.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {availableSlots.map((slot, index) => (
        <button
          key={`${slot.startTime}-${slot.endTime}-${index}`}
          onClick={() => slot.isAvailable && onSlotSelect(slot)}
          disabled={!slot.isAvailable}
          className={`
            p-4 rounded-lg border transition-all
            ${
              slot.isAvailable
                ? 'border-green-200 hover:border-green-400 bg-green-50 hover:bg-green-100'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
            }
          `}
        >
          <div className="text-lg font-semibold">
            {slot.startTime} - {slot.endTime}
          </div>
          <div className="text-sm text-gray-600">
            {slot.isAvailable ? 'Disponible' : 'Non disponible'}
          </div>
        </button>
      ))}
    </div>
  );
};
