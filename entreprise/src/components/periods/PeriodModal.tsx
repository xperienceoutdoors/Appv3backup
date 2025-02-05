import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { Period, Activity, DaySchedule } from '../../types/business/Period';

interface PeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (period: Period) => void;
  onDelete?: () => void;
  period?: Period | null;
  activities: Activity[];
}

const defaultDaySchedules: DaySchedule[] = [
  { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: false },
  { dayOfWeek: 7, startTime: '09:00', endTime: '18:00', isActive: false },
];

const PeriodModal: React.FC<PeriodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  period,
  activities,
}) => {
  const [formData, setFormData] = useState<Partial<Period>>({
    name: '',
    activities: [],
    startDate: new Date(),
    endDate: new Date(),
    schedule: defaultDaySchedules,
    isOffPeak: false,
  });

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (period) {
      setFormData({
        ...period,
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
      });
    } else {
      setFormData({
        name: '',
        activities: [],
        startDate: new Date(),
        endDate: new Date(),
        schedule: defaultDaySchedules,
        isOffPeak: false,
      });
    }
  }, [period]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name) {
      newErrors.push('Le nom de la période est requis');
    }

    if (!formData.activities || formData.activities.length === 0) {
      newErrors.push('Veuillez sélectionner au moins une activité');
    }

    if (!formData.startDate || !formData.endDate) {
      newErrors.push('Les dates de début et de fin sont requises');
    } else if (formData.startDate > formData.endDate) {
      newErrors.push('La date de fin doit être après la date de début');
    }

    const hasActiveDays = formData.schedule?.some((day) => day.isActive);
    if (!hasActiveDays) {
      newErrors.push('Au moins un jour doit être sélectionné');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData as Period);
    }
  };

  const handleScheduleChange = (dayOfWeek: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...(formData.schedule || [])];
    const dayIndex = newSchedule.findIndex((day) => day.dayOfWeek === dayOfWeek);
    
    if (dayIndex !== -1) {
      newSchedule[dayIndex] = {
        ...newSchedule[dayIndex],
        [field]: value,
      };
      setFormData({ ...formData, schedule: newSchedule });
    }
  };

  const handleActivityToggle = (activityId: string) => {
    const currentActivities = formData.activities || [];
    const newActivities = currentActivities.includes(activityId)
      ? currentActivities.filter(id => id !== activityId)
      : [...currentActivities, activityId];
    
    setFormData({ ...formData, activities: newActivities });
  };

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={period ? 'Modifier la période' : 'Nouvelle période'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <ul className="list-disc list-inside text-red-600 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Nom de la période */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)]">
            Nom de la période
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-[var(--primary-color)] border-opacity-20 px-3 py-2"
            placeholder="Ex: Haute saison été 2025"
          />
        </div>

        {/* Sélection des activités */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)]">
            Activités concernées
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                onClick={() => handleActivityToggle(activity.id)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  formData.activities?.includes(activity.id)
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-5'
                    : 'border-[var(--primary-color)] border-opacity-20 hover:border-opacity-40'
                }`}
              >
                <span className="text-sm font-medium text-[var(--primary-color)]">
                  {activity.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)]">
              Date de début
            </label>
            <input
              type="date"
              value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setFormData({ ...formData, startDate: new Date(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border border-[var(--primary-color)] border-opacity-20 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--primary-color)]">
              Date de fin
            </label>
            <input
              type="date"
              value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
              onChange={(e) =>
                setFormData({ ...formData, endDate: new Date(e.target.value) })
              }
              className="mt-1 block w-full rounded-md border border-[var(--primary-color)] border-opacity-20 px-3 py-2"
            />
          </div>
        </div>

        {/* Planning hebdomadaire */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
            Planning hebdomadaire
          </label>
          <div className="space-y-3">
            {formData.schedule?.map((day, index) => (
              <div key={day.dayOfWeek} className="grid grid-cols-[auto,1fr] gap-4 items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={day.isActive}
                    onChange={(e) =>
                      handleScheduleChange(day.dayOfWeek, 'isActive', e.target.checked)
                    }
                    className="rounded border-[var(--primary-color)] border-opacity-20"
                  />
                  <span className="text-sm font-medium text-[var(--primary-color)] w-24">
                    {dayNames[index]}
                  </span>
                </div>
                {day.isActive && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) =>
                          handleScheduleChange(day.dayOfWeek, 'startTime', e.target.value)
                        }
                        className="block w-full rounded-md border border-[var(--primary-color)] border-opacity-20 px-3 py-1.5 text-sm"
                      />
                      <span className="text-sm text-[var(--primary-color)]">à</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) =>
                          handleScheduleChange(day.dayOfWeek, 'endTime', e.target.value)
                        }
                        className="block w-full rounded-md border border-[var(--primary-color)] border-opacity-20 px-3 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Période creuse */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isOffPeak}
            onChange={(e) => setFormData({ ...formData, isOffPeak: e.target.checked })}
            className="rounded border-[var(--primary-color)] border-opacity-20"
          />
          <label className="ml-2 text-sm text-[var(--primary-color)]">
            Période creuse (tarifs réduits)
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          {period && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="button-danger"
            >
              Supprimer
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="button-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="button-primary"
          >
            {period ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PeriodModal;
