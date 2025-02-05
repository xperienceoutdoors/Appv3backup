import React from 'react';
import { Activity } from '../../types/business/Period';

interface ActivitySelectorProps {
  activities: Activity[];
  selectedActivities: string[];
  onChange: (selectedIds: string[]) => void;
}

const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activities,
  selectedActivities,
  onChange,
}) => {
  const handleActivityToggle = (activityId: string) => {
    const newSelection = selectedActivities.includes(activityId)
      ? selectedActivities.filter(id => id !== activityId)
      : [...selectedActivities, activityId];
    onChange(newSelection);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
        Activités
      </label>
      <div className="grid grid-cols-2 gap-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`
              p-3 rounded-lg border cursor-pointer transition-all
              ${
                selectedActivities.includes(activity.id)
                  ? 'border-[var(--accent-color)] bg-[var(--accent-color)] bg-opacity-5'
                  : 'border-[var(--primary-color)] border-opacity-10 hover:border-opacity-20'
              }
            `}
            onClick={() => handleActivityToggle(activity.id)}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedActivities.includes(activity.id)}
                onChange={() => handleActivityToggle(activity.id)}
                className="form-checkbox h-4 w-4 text-[var(--accent-color)]"
              />
              <span className="text-[var(--primary-color)]">{activity.name}</span>
            </div>
          </div>
        ))}
      </div>
      {activities.length === 0 && (
        <p className="text-sm text-[var(--primary-color)] text-opacity-70">
          Aucune activité disponible. Veuillez d'abord créer des activités.
        </p>
      )}
    </div>
  );
};

export default ActivitySelector;
