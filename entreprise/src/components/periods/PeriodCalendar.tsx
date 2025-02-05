import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Period, Activity } from '../../types/business/Period';
import '../reservation/CustomCalendar.css';

interface PeriodCalendarProps {
  periods: Period[];
  activities: Activity[];
  onPeriodClick?: (period: Period) => void;
}

const PeriodCalendar: React.FC<PeriodCalendarProps> = ({
  periods,
  activities,
  onPeriodClick,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedActivity, setSelectedActivity] = useState<string>('all');
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Filtrer les périodes en fonction de l'activité sélectionnée
  const filteredPeriods = periods.filter(
    (period) =>
      selectedActivity === 'all' ||
      period.activityId === selectedActivity
  );

  // Trouver les périodes pour une date donnée
  const getPeriodsForDate = (date: Date): Period[] => {
    return filteredPeriods.filter((period) => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      const dayOfWeek = date.getDay() || 7;
      const schedule = period.schedule.find(s => s.dayOfWeek === dayOfWeek);
      return date >= startDate && date <= endDate && schedule?.isActive;
    });
  };

  // Générer les classes CSS pour une date donnée
  const getTileClassName = ({ date }: { date: Date }): string => {
    const matchingPeriods = getPeriodsForDate(date);
    const classes = [];

    if (matchingPeriods.length > 0) {
      classes.push('has-periods');
    }

    return classes.join(' ');
  };

  // Contenu personnalisé pour chaque date
  const getTileContent = ({ date }: { date: Date }) => {
    const periodsForDate = getPeriodsForDate(date);
    if (periodsForDate.length === 0) return null;

    return (
      <div className="text-xs mt-1">
        {periodsForDate.map((period, index) => {
          const activity = activities.find(a => a.id === period.activityId);
          const schedule = period.schedule.find(s => s.dayOfWeek === (date.getDay() || 7));
          if (!schedule) return null;
          
          return (
            <div 
              key={index}
              className="text-[var(--primary-color)] truncate cursor-pointer hover:bg-gray-100 rounded px-1"
              title={`${period.name} - ${activity?.name}: ${schedule.startTime}-${schedule.endTime}`}
              onClick={(e) => {
                e.stopPropagation(); // Empêcher le clic de se propager à la date
                if (onPeriodClick) {
                  onPeriodClick(period);
                }
              }}
            >
              {period.name}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filtre par activité */}
      <div className="flex gap-2">
        <select
          value={selectedActivity}
          onChange={(e) => setSelectedActivity(e.target.value)}
          className="select-input"
        >
          <option value="all">Toutes les activités</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activity.name}
            </option>
          ))}
        </select>
      </div>

      {/* Calendrier */}
      <Calendar
        onChange={(date: Date) => setSelectedDate(date)}
        value={selectedDate}
        className="w-full rounded-lg border border-[var(--primary-color)] border-opacity-10 custom-calendar"
        tileClassName={getTileClassName}
        tileContent={getTileContent}
      />
    </div>
  );
};

export default PeriodCalendar;
