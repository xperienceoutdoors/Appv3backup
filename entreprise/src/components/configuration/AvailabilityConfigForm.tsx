import React, { useState, useEffect } from 'react';
import { AvailabilityConfig } from '../../types/business/AvailabilityConfig';
import { availabilityConfigService } from '../../services/availabilityConfigService';

interface AvailabilityConfigFormProps {
  activityId: string;
  onSave: (config: AvailabilityConfig) => void;
  onCancel: () => void;
}

const AvailabilityConfigForm: React.FC<AvailabilityConfigFormProps> = ({
  activityId,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<AvailabilityConfig | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadConfig();
  }, [activityId]);

  const loadConfig = async () => {
    try {
      let loadedConfig = await availabilityConfigService.getConfig(activityId);
      if (!loadedConfig) {
        loadedConfig = availabilityConfigService.generateDefaultConfig(activityId);
      }
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
      setErrors(['Erreur lors du chargement de la configuration']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    try {
      const validation = availabilityConfigService.validateConfig(config);
      setErrors(validation.errors);
      setWarnings(validation.warnings);

      if (validation.isValid) {
        const savedConfig = await availabilityConfigService.saveConfig(config);
        onSave(savedConfig);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setErrors(['Erreur lors de la sauvegarde de la configuration']);
    }
  };

  const updateTimeSlots = (field: keyof typeof config.timeSlots, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      timeSlots: {
        ...config.timeSlots,
        [field]: value,
      },
    });
  };

  const updateDynamicPricing = (field: keyof typeof config.dynamicPricing, value: number) => {
    if (!config || !config.dynamicPricing) return;
    setConfig({
      ...config,
      dynamicPricing: {
        ...config.dynamicPricing,
        [field]: value,
      },
    });
  };

  if (!config) return <div>Chargement...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Affichage des erreurs et avertissements */}
      {errors.length > 0 && (
        <div className="bg-red-50 p-4 rounded-md">
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-700">{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="bg-yellow-50 p-4 rounded-md">
          <ul className="list-disc pl-5 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-yellow-700">{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Configuration des créneaux */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Configuration des créneaux</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Heure d'ouverture</label>
            <input
              type="time"
              value={config.timeSlots.minStartTime}
              onChange={(e) => updateTimeSlots('minStartTime', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Heure de fermeture</label>
            <input
              type="time"
              value={config.timeSlots.maxEndTime}
              onChange={(e) => updateTimeSlots('maxEndTime', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Durée par défaut (minutes)</label>
            <input
              type="number"
              value={config.timeSlots.defaultDuration}
              onChange={(e) => updateTimeSlots('defaultDuration', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Intervalle (minutes)</label>
            <input
              type="number"
              value={config.timeSlots.intervalMinutes}
              onChange={(e) => updateTimeSlots('intervalMinutes', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Configuration de la tarification dynamique */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tarification dynamique</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Multiplicateur heures de pointe</label>
            <input
              type="number"
              step="0.1"
              value={config.dynamicPricing?.peakHourMultiplier}
              onChange={(e) => updateDynamicPricing('peakHourMultiplier', parseFloat(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Réduction dernière minute (%)</label>
            <input
              type="number"
              value={config.dynamicPricing?.lastMinuteDiscount}
              onChange={(e) => updateDynamicPricing('lastMinuteDiscount', parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default AvailabilityConfigForm;
