import React, { useState } from 'react';
import { Activity } from '../../types/activity';
import { AvailabilitySelector } from '../availability/AvailabilitySelector';
import { AvailabilitySlot } from '../../services/availabilityService';
import { DatePicker } from '../common/DatePicker';

interface BookingFormProps {
  activity: Activity;
  onSubmit: (booking: {
    date: Date;
    startTime: string;
    endTime: string;
    quantity: number;
  }) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ activity, onSubmit }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [quantity, setQuantity] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const handleSlotSelect = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    onSubmit({
      date: selectedDate,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      quantity,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date || new Date());
            setSelectedSlot(null);
          }}
          className="mt-1"
          minDate={new Date()}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre de personnes
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => {
            setQuantity(Number(e.target.value));
            setSelectedSlot(null);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Créneaux disponibles
        </label>
        <AvailabilitySelector
          activity={activity}
          selectedDate={selectedDate}
          requestedQuantity={quantity}
          onSlotSelect={handleSlotSelect}
        />
      </div>

      {selectedSlot && (
        <div className="bg-green-50 p-4 rounded-md">
          <h4 className="font-medium text-green-800">Créneau sélectionné</h4>
          <p className="text-green-700">
            {selectedSlot.startTime} - {selectedSlot.endTime}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedSlot}
        className={`w-full py-2 px-4 rounded-md ${
          selectedSlot
            ? 'bg-primary-600 hover:bg-primary-700 text-white'
            : 'bg-gray-300 cursor-not-allowed text-gray-500'
        }`}
      >
        Réserver
      </button>
    </form>
  );
};
