import React, { useState, useEffect } from 'react';
import { DayAvailability, AvailableTimeSlot } from '../../services/realTimeAvailabilityService';
import { realTimeAvailabilityService } from '../../services/realTimeAvailabilityService';
import './CustomCalendar.css';

interface RealTimeAvailabilityCalendarProps {
  activityId?: string;
  onSlotSelect: (slot: AvailableTimeSlot, date: string) => void;
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  selectedSlot?: AvailableTimeSlot;
  showOnlyDates?: boolean;
  showOnlyTimeSlots?: boolean;
}

const RealTimeAvailabilityCalendar: React.FC<RealTimeAvailabilityCalendarProps> = ({
  activityId,
  onSlotSelect,
  onDateSelect,
  selectedDate,
  selectedSlot,
  showOnlyDates = false,
  showOnlyTimeSlots = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      if (!activityId) {
        setAvailability([]);
        setLoading(false);
        return;
      }

      try {
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        const availabilityData = await realTimeAvailabilityService.getAvailability(
          activityId,
          startDate,
          endDate
        );
        setAvailability(availabilityData);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setError('Erreur lors du chargement des disponibilités');
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [currentMonth, activityId]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const availabilityData = await realTimeAvailabilityService.getAvailability(
        activityId || '',
        startDate,
        endDate
      );
      setAvailability(availabilityData);
    } catch (err) {
      setError('Erreur lors du chargement des disponibilités');
      console.error('Error loading availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + offset);
      return newMonth;
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleDateClick = (date: string) => {
    if (showOnlyDates) {
      onDateSelect?.(date);
    } else if (!showOnlyTimeSlots) {
      setExpandedDate(expandedDate === date ? null : date);
    }
  };

  const handleSlotSelect = (
    e: React.MouseEvent,
    slot: AvailableTimeSlot,
    date: string
  ) => {
    e.stopPropagation();
    onSlotSelect(slot, date);
  };

  const generateCalendarCells = () => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startingDayOfWeek = firstDay.getDay() || 7; // Convertir 0 (dimanche) en 7
    const daysInMonth = lastDay.getDate();

    const cells = [];
    
    // Ajouter les cellules vides pour les jours avant le début du mois
    for (let i = 1; i < startingDayOfWeek; i++) {
      cells.push(<td key={`empty-${i}`} className="empty-cell"></td>);
    }

    // Générer les cellules pour chaque jour du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAvailability = availability.find(a => a.date === date);
      
      cells.push(
        <td
          key={date}
          className={`calendar-cell
            ${dayAvailability?.isOpen ? 'has-slots' : 'no-slots'}
            ${date === selectedDate ? 'selected' : ''}
            ${date === expandedDate ? 'expanded' : ''}
            ${dayAvailability?.timeSlots.some(slot => slot.isLastMinute) ? 'has-last-minute' : ''}
            ${dayAvailability?.timeSlots.some(slot => slot.isEarlyBird) ? 'has-early-bird' : ''}
          `}
          onClick={() => handleDateClick(date)}
        >
          <div className="date-container">
            <span className="date-number">{day}</span>
            {dayAvailability?.isOpen && !showOnlyDates && (
              <div className="availability-info">
                <span className="slot-count">
                  {dayAvailability.timeSlots.length} créneaux
                </span>
                {dayAvailability.timeSlots.length > 0 && (
                  <span className="price-range">
                    {formatPrice(Math.min(...dayAvailability.timeSlots.map(s => s.price)))}
                    {' - '}
                    {formatPrice(Math.max(...dayAvailability.timeSlots.map(s => s.price)))}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {((date === expandedDate && !showOnlyDates) || (showOnlyTimeSlots && date === selectedDate)) && 
           dayAvailability && (
            <div className="time-slots-container">
              {/* Grouper les créneaux par formule */}
              {Object.entries(
                dayAvailability.timeSlots.reduce((acc, slot) => {
                  const formulaId = slot.formula.id;
                  if (!acc[formulaId]) {
                    acc[formulaId] = {
                      formula: slot.formula,
                      slots: []
                    };
                  }
                  acc[formulaId].slots.push(slot);
                  return acc;
                }, {} as Record<string, { formula: any; slots: AvailableTimeSlot[] }>)
              ).map(([formulaId, { formula, slots }]) => (
                <div key={formulaId} className="formula-group">
                  <h4 className="formula-title">
                    {formula.name} - {formula.duration} min
                  </h4>
                  <div className="formula-slots">
                    {slots.map((slot) => (
                      <div
                        key={`${date}-${slot.startTime}`}
                        className={`time-slot ${
                          selectedSlot?.startTime === slot.startTime &&
                          selectedSlot?.formula.id === formula.id
                            ? 'selected'
                            : ''
                        } ${slot.remainingSpots === 0 ? 'full' : ''}`}
                        onClick={(e) => handleSlotSelect(e, slot, date)}
                      >
                        <div className="time-range">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        <div className="slot-info">
                          <span className="price">{formatPrice(slot.price)}</span>
                          <span className="spots">
                            {slot.remainingSpots} places restantes
                          </span>
                        </div>
                        {(slot.isLastMinute || slot.isEarlyBird || slot.isPeakHour) && (
                          <div className="tags">
                            {slot.isLastMinute && (
                              <span className="tag last-minute">Dernière minute</span>
                            )}
                            {slot.isEarlyBird && (
                              <span className="tag early-bird">Early Bird</span>
                            )}
                            {slot.isPeakHour && (
                              <span className="tag peak-hour">Heure de pointe</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </td>
      );
    }

    return cells;
  };

  if (loading) {
    return <div className="loading">Chargement des disponibilités...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="real-time-calendar">
      {!showOnlyTimeSlots && (
        <>
          <div className="calendar-header">
            <button onClick={() => changeMonth(-1)}>&lt;</button>
            <h2>
              {currentMonth.toLocaleDateString('fr-FR', {
                month: 'long',
                year: 'numeric'
              })}
            </h2>
            <button onClick={() => changeMonth(1)}>&gt;</button>
          </div>

          <table className="calendar-grid">
            <thead>
              <tr>
                <th>Lun</th>
                <th>Mar</th>
                <th>Mer</th>
                <th>Jeu</th>
                <th>Ven</th>
                <th>Sam</th>
                <th>Dim</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: Math.ceil((generateCalendarCells().length) / 7) }, (_, i) => (
                <tr key={i}>
                  {generateCalendarCells().slice(i * 7, (i + 1) * 7)}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default RealTimeAvailabilityCalendar;
