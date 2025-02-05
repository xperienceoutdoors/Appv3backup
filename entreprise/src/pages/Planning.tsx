import React, { useState } from 'react';
import PageLayout from '../components/layout/PageLayout';

const Planning: React.FC = () => {
  const [currentDate] = useState(new Date());
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h à 20h

  return (
    <PageLayout
      title="Planning"
      actions={
        <button className="button-primary">
          Nouvelle réservation
        </button>
      }
    >
      {/* En-tête avec filtres */}
      <div className="card flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-[var(--primary-color)] hover:bg-opacity-5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-[var(--primary-color)]">
            {currentDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h2>
          <button className="p-2 hover:bg-[var(--primary-color)] hover:bg-opacity-5 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <select className="rounded-lg border border-[var(--primary-color)]/10 px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]">
            <option>Tous les équipements</option>
            <option>Kayak</option>
            <option>Paddle</option>
          </select>
          <select className="rounded-lg border border-[var(--primary-color)]/10 px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]">
            <option>Vue journalière</option>
            <option>Vue hebdomadaire</option>
          </select>
        </div>
      </div>

      {/* Grille du planning */}
      <div className="card overflow-x-auto">
        <div className="min-w-[800px]">
          {/* En-tête des heures */}
          <div className="grid grid-cols-[100px_repeat(12,1fr)] border-b border-[var(--primary-color)]/10">
            <div className="p-3 font-medium text-[var(--primary-color)]">Équipement</div>
            {hours.map(hour => (
              <div key={hour} className="p-3 text-center font-medium text-[var(--primary-color)]">
                {hour}:00
              </div>
            ))}
          </div>

          {/* Lignes des équipements */}
          {['Kayak 1', 'Kayak 2', 'Paddle 1', 'Paddle 2'].map((equipment, index) => (
            <div 
              key={equipment}
              className={`grid grid-cols-[100px_repeat(12,1fr)] ${
                index !== 3 ? 'border-b border-[var(--primary-color)]/10' : ''
              }`}
            >
              <div className="p-3 font-medium text-[var(--primary-color)]">{equipment}</div>
              {hours.map(hour => (
                <div 
                  key={`${equipment}-${hour}`}
                  className="p-3 border-l border-[var(--primary-color)]/10 relative min-h-[80px]"
                >
                  {/* Exemple de réservation */}
                  {hour === 10 && equipment === 'Kayak 1' && (
                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-[var(--accent-color)] bg-opacity-20 rounded-lg p-2">
                      <div className="text-sm font-medium text-[var(--primary-color)]">
                        Réservation #123
                      </div>
                      <div className="text-xs text-[var(--primary-color)]/70">
                        10:00 - 12:00
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Planning;
