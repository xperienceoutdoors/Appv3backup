import React, { useState, useEffect } from 'react';
import { OptionalSale } from '../../types/business/OptionalSale';
import optionalSaleService from '../../services/optionalSaleService';
import { activityService } from '../../services/activityService';

interface OptionalSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (optionalSale: OptionalSale) => void;
  optionalSale?: OptionalSale;
}

const defaultOptionalSale: Partial<OptionalSale> = {
  name: '',
  description: '',
  price: 0,
  isActive: true,
  type: 'service',
  activities: [],
  unit: 'par personne'
};

const OptionalSaleModal: React.FC<OptionalSaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  optionalSale,
}) => {
  const [formData, setFormData] = useState<Partial<OptionalSale>>(defaultOptionalSale);
  const [errors, setErrors] = useState<string[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const loadedActivities = await activityService.getAll();
        setActivities(loadedActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
        setErrors(['Erreur lors du chargement des activités']);
      }
    };

    loadActivities();
  }, []);

  useEffect(() => {
    if (optionalSale) {
      setFormData(optionalSale);
    } else {
      setFormData(defaultOptionalSale);
    }
  }, [optionalSale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    try {
      const errors = optionalSaleService.validateOptionalSale(formData as OptionalSale);
      if (errors.length > 0) {
        setErrors(errors);
        return;
      }

      onSave(formData as OptionalSale);
      onClose();
    } catch (error) {
      console.error('Error saving optional sale:', error);
      setErrors(['Erreur lors de l\'enregistrement']);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-[var(--primary-color)] mb-6">
              {optionalSale ? 'Modifier la vente optionnelle' : 'Nouvelle vente optionnelle'}
            </h2>

            {/* Erreurs */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <ul className="list-disc list-inside text-red-600">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              {/* Nom et Description */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="input-primary w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as OptionalSale['type'],
                      }))
                    }
                    className="input-primary w-full"
                  >
                    <option value="service">Service</option>
                    <option value="product">Produit</option>
                    <option value="insurance">Assurance</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input-primary w-full h-24"
                />
              </div>

              {/* Prix et Unité */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                    Prix
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: parseFloat(e.target.value),
                      }))
                    }
                    className="input-primary w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                    Unité
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit: e.target.value,
                      }))
                    }
                    className="input-primary w-full"
                  >
                    <option value="par personne">Par personne</option>
                    <option value="par groupe">Par groupe</option>
                    <option value="par réservation">Par réservation</option>
                  </select>
                </div>
              </div>

              {/* Activités associées */}
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Activités associées
                </label>
                <select
                  multiple
                  value={formData.activities || []}
                  onChange={(e) => {
                    const selectedActivities = Array.from(e.target.selectedOptions).map(option => option.value);
                    setFormData(prev => ({
                      ...prev,
                      activities: selectedActivities
                    }));
                  }}
                  className="input-primary w-full h-32"
                >
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs activités
                </p>
              </div>

              {/* Actif */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="checkbox-primary"
                />
                <label className="ml-2 text-sm font-medium text-[var(--primary-color)]">
                  Actif
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-4">
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OptionalSaleModal;
