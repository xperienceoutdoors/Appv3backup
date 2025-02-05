import React, { useState, useEffect } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { Period, Activity } from '../../types/business/Period';
import periodService from '../../services/periodService';
import PeriodModal from '../../components/periods/PeriodModal';
import PeriodCalendar from '../../components/periods/PeriodCalendar';
import { activityService } from '../../services/activityService';

const Periods: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [activities, setActivities] = useState<Activity[]>([]);

  // Charger les activités
  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await activityService.getAll();
        setActivities(data);
      } catch (err) {
        console.error('Erreur lors du chargement des activités:', err);
      }
    };
    loadActivities();
  }, []);

  // Charger les périodes
  const loadPeriods = async () => {
    try {
      setIsLoading(true);
      const data = await periodService.getAll();
      // S'assurer que les dates sont des objets Date
      const periodsWithDates = data.map(period => ({
        ...period,
        startDate: period.startDate instanceof Date ? period.startDate : new Date(period.startDate),
        endDate: period.endDate instanceof Date ? period.endDate : new Date(period.endDate)
      }));
      setPeriods(periodsWithDates);
    } catch (err) {
      setError('Erreur lors du chargement des périodes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  // Gérer la sauvegarde d'une période
  const handleSavePeriod = async (periodData: Period) => {
    try {
      if (editingPeriod) {
        await periodService.update(editingPeriod.id, {
          ...periodData,
          startDate: periodData.startDate instanceof Date 
            ? periodData.startDate
            : new Date(periodData.startDate),
          endDate: periodData.endDate instanceof Date 
            ? periodData.endDate
            : new Date(periodData.endDate)
        });
      } else {
        await periodService.create({
          ...periodData,
          startDate: periodData.startDate instanceof Date 
            ? periodData.startDate
            : new Date(periodData.startDate),
          endDate: periodData.endDate instanceof Date 
            ? periodData.endDate
            : new Date(periodData.endDate)
        });
      }
      await loadPeriods();
      setIsModalOpen(false);
      setEditingPeriod(null);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la période:', err);
      setError('Erreur lors de la sauvegarde de la période');
    }
  };

  // Gérer le clic sur une période
  const handlePeriodClick = (period: Period) => {
    setEditingPeriod(period);
    setIsModalOpen(true);
  };

  // Gérer la suppression d'une période
  const handleDeletePeriod = async (periodId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette période ?')) {
      return;
    }

    try {
      await periodService.delete(periodId);
      await loadPeriods();
      setIsModalOpen(false);
      setEditingPeriod(null);
    } catch (err) {
      console.error('Erreur lors de la suppression de la période:', err);
      setError('Erreur lors de la suppression de la période');
    }
  };

  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  if (isLoading) {
    return (
      <PageLayout title="Périodes et Horaires d'ouverture">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Périodes et Horaires d'ouverture"
      actions={
        <div className="flex gap-4">
          <div className="flex rounded-lg border border-[var(--primary-color)] border-opacity-10 p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                viewMode === 'calendar'
                  ? 'bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]'
                  : 'text-[var(--primary-color)] text-opacity-70 hover:text-opacity-100'
              }`}
              onClick={() => setViewMode('calendar')}
            >
              Calendrier
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm ${
                viewMode === 'list'
                  ? 'bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]'
                  : 'text-[var(--primary-color)] text-opacity-70 hover:text-opacity-100'
              }`}
              onClick={() => setViewMode('list')}
            >
              Liste
            </button>
          </div>
          <button
            className="button-primary"
            onClick={() => {
              setEditingPeriod(null);
              setIsModalOpen(true);
            }}
          >
            Nouvelle période
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg text-red-600">
          {error}
          <button
            className="ml-2 text-sm underline"
            onClick={() => setError(null)}
          >
            Fermer
          </button>
        </div>
      )}

      <div className="space-y-6">
        {viewMode === 'calendar' ? (
          <div className="card">
            <PeriodCalendar
              periods={periods}
              activities={activities}
              onPeriodClick={handlePeriodClick}
            />
          </div>
        ) : periods.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-[var(--primary-color)] text-opacity-70">
              Aucune période configurée
            </h3>
            <p className="mt-2 text-sm text-[var(--primary-color)] text-opacity-50">
              Commencez par créer une nouvelle période pour configurer vos horaires d'ouverture
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {periods.map((period) => (
              <div key={period.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--primary-color)]">
                      {period.name}
                    </h3>
                    <p className="text-[var(--primary-color)] text-opacity-70">
                      Du {new Date(period.startDate).toLocaleDateString()} au{' '}
                      {new Date(period.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="button-secondary"
                      onClick={() => handlePeriodClick(period)}
                    >
                      Modifier
                    </button>
                    <button
                      className="button-danger"
                      onClick={() => handleDeletePeriod(period.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Horaires par jour */}
                <div className="grid gap-4">
                  {period.schedule
                    .filter((day) => day.isActive)
                    .map((day) => (
                      <div
                        key={day.dayOfWeek}
                        className="flex items-center justify-between py-2 border-b border-[var(--primary-color)] border-opacity-10"
                      >
                        <span className="font-medium text-[var(--primary-color)]">
                          {dayNames[day.dayOfWeek - 1]}
                        </span>
                        <div className="text-[var(--primary-color)] text-opacity-70">
                          {day.startTime} - {day.endTime}
                          {day.breakStartTime && day.breakEndTime && (
                            <span className="ml-2">
                              (Pause : {day.breakStartTime} - {day.breakEndTime})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Badge période creuse */}
                {period.isOffPeak && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent-color)] bg-opacity-10 text-[var(--accent-color)]">
                      Période creuse
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      <PeriodModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPeriod(null);
        }}
        onSave={handleSavePeriod}
        onDelete={editingPeriod ? () => handleDeletePeriod(editingPeriod.id) : undefined}
        period={editingPeriod}
        activities={activities}
      />
    </PageLayout>
  );
};

export default Periods;
