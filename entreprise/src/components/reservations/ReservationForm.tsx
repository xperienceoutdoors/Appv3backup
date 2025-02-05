import React, { useState, useEffect } from 'react';
import { Activity } from '../../types/business/Activity';
import { TimeSlot } from '../../services/availabilityService';
import { reservationService, ReservationRequest } from '../../services/reservationService';
import availabilityService from '../../services/availabilityService';

interface ReservationFormProps {
  activity: Activity;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  activity,
  onSuccess,
  onError,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [participants, setParticipants] = useState<number>(
    activity.minParticipants || 1
  );
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les créneaux disponibles quand la date change
  useEffect(() => {
    const loadSlots = async () => {
      try {
        const slots = await availabilityService.getAvailableSlots(
          activity,
          selectedDate
        );
        setAvailableSlots(slots);
      } catch (err) {
        setError('Erreur lors du chargement des créneaux disponibles');
        onError?.('Erreur lors du chargement des créneaux disponibles');
      }
    };

    loadSlots();
  }, [activity, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Veuillez sélectionner un créneau');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reservationRequest: ReservationRequest = {
        activityId: activity.id,
        date: selectedDate,
        startTime: selectedSlot.start,
        participants,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
      };

      const reservation = await reservationService.createReservation(
        reservationRequest
      );
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Créneau horaire
        </label>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {availableSlots.map((slot, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedSlot(slot)}
              className={`p-2 text-sm rounded-md ${
                selectedSlot === slot
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {formatTime(slot.start)} - {formatTime(slot.end)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre de participants
        </label>
        <input
          type="number"
          value={participants}
          onChange={(e) => setParticipants(Number(e.target.value))}
          min={activity.minParticipants || 1}
          max={activity.maxParticipants}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nom
        </label>
        <input
          type="text"
          value={customerInfo.name}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, name: e.target.value })
          }
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={customerInfo.email}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, email: e.target.value })
          }
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <input
          type="tel"
          value={customerInfo.phone}
          onChange={(e) =>
            setCustomerInfo({ ...customerInfo, phone: e.target.value })
          }
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isLoading || !selectedSlot}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Réservation en cours...' : 'Réserver'}
      </button>
    </form>
  );
};

export default ReservationForm;
