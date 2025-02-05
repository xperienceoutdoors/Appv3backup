import React, { useState, useEffect } from 'react';
import { Formula, Rate, TimeSlot } from '../../types/business/Formula';
import resourceService from '../../services/resourceService';
import { Resource } from '../../types/business/Resource';
import Modal from '../common/Modal';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formula: Formula) => void;
  formula: Formula | null;
}

const FormulaModal: React.FC<FormulaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  formula,
}) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('60');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [newRate, setNewRate] = useState<Partial<Rate>>({
    name: '',
    price: 0,
    vat: 20,
  });
  const [selectedResources, setSelectedResources] = useState<{
    resourceId: string;
    quantity: number;
    required: boolean;
  }[]>([]);

  // État pour le générateur d'horaires
  const [timeGenerator, setTimeGenerator] = useState({
    startTime: '09:00',
    endTime: '18:00',
    interval: 30,
  });

  useEffect(() => {
    const loadResources = async () => {
      try {
        const loadedResources = await resourceService.getAll();
        setResources(loadedResources);
      } catch (error) {
        console.error('Erreur lors du chargement des ressources:', error);
      }
    };
    loadResources();
  }, []);

  useEffect(() => {
    if (formula) {
      setName(formula.name);
      setDuration(formula.duration.toString());
      setTimeSlots(formula.timeSlots);
      setRates(formula.rates);
      setSelectedResources(formula.resources || []);
    } else {
      resetForm();
    }
  }, [formula]);

  const resetForm = () => {
    setName('');
    setDuration('60');
    setTimeSlots([]);
    setRates([]);
    setNewTimeSlot('');
    setSelectedResources([]);
    setNewRate({ name: '', price: 0, vat: 20 });
  };

  const handleAddRate = () => {
    if (newRate.name && newRate.price >= 0) {
      const rate: Rate = {
        id: crypto.randomUUID(),
        name: newRate.name,
        price: newRate.price,
        vat: newRate.vat || 20,
      };
      setRates([...rates, rate]);
      setNewRate({ name: '', price: 0, vat: 20 });
    }
  };

  const handleResourceChange = (resourceId: string, field: 'quantity' | 'required', value: number | boolean) => {
    setSelectedResources(prev => {
      const existing = prev.find(r => r.resourceId === resourceId);
      if (existing) {
        return prev.map(r => r.resourceId === resourceId ? { ...r, [field]: value } : r);
      } else {
        return [...prev, { 
          resourceId, 
          quantity: field === 'quantity' ? value as number : 1,
          required: field === 'required' ? value as boolean : false
        }];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Valider que les ressources sélectionnées sont disponibles
    const resourceValidation = selectedResources.every(selectedResource => {
      const resource = resources.find(r => r.id === selectedResource.resourceId);
      return resource && selectedResource.quantity <= resource.totalQuantity;
    });

    if (!resourceValidation) {
      alert('Certaines ressources sélectionnées dépassent la quantité disponible');
      return;
    }

    // Créer la formule avec les ressources sélectionnées
    const formulaData: Formula = {
      id: formula?.id || crypto.randomUUID(),
      name,
      duration: parseInt(duration),
      timeSlots,
      rates,
      resources: selectedResources,
      isActive: true,
    };

    onSave(formulaData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formula ? 'Modifier la formule' : 'Nouvelle formule'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom de la formule */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom de la formule
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
            required
          />
        </div>

        {/* Durée */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Durée (minutes)
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
            min="1"
            required
          />
        </div>

        {/* Ressources */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ressources nécessaires
          </label>
          <div className="space-y-4">
            {resources.map((resource) => {
              const selectedResource = selectedResources.find(
                (r) => r.resourceId === resource.id
              );
              return (
                <div key={resource.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-grow">
                    <div className="font-medium">{resource.name}</div>
                    <div className="text-sm text-gray-500">{resource.description}</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!!selectedResource}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedResources([
                              ...selectedResources,
                              { resourceId: resource.id, quantity: 1, required: true },
                            ]);
                          } else {
                            setSelectedResources(
                              selectedResources.filter((r) => r.resourceId !== resource.id)
                            );
                          }
                        }}
                        className="rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                      />
                      <span className="text-sm">Utiliser</span>
                    </label>
                    {selectedResource && (
                      <>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm">Quantité:</label>
                          <input
                            type="number"
                            value={selectedResource.quantity}
                            onChange={(e) => handleResourceChange(
                              resource.id,
                              'quantity',
                              parseInt(e.target.value)
                            )}
                            min="1"
                            max={resource.totalQuantity}
                            className="w-20 rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                          />
                        </div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedResource.required}
                            onChange={(e) => handleResourceChange(
                              resource.id,
                              'required',
                              e.target.checked
                            )}
                            className="rounded border-gray-300 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                          />
                          <span className="text-sm">Obligatoire</span>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horaires */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Horaires disponibles
          </label>
          <div className="mt-2 space-y-4">
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-md"
                >
                  <span>{slot.time}</span>
                  <button
                    type="button"
                    onClick={() => setTimeSlots(timeSlots.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <input
                type="time"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  if (newTimeSlot) {
                    setTimeSlots([...timeSlots, { time: newTimeSlot }]);
                    setNewTimeSlot('');
                  }
                }}
                className="button-primary"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Tarifs */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tarifs
          </label>
          <div className="mt-2 space-y-4">
            <div className="grid gap-4">
              {rates.map((rate, index) => (
                <div
                  key={rate.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{rate.name}</div>
                    <div className="text-sm text-gray-500">{rate.price}€ (TVA {rate.vat}%)</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRates(rates.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nom du tarif"
                value={newRate.name}
                onChange={(e) => setNewRate({ ...newRate, name: e.target.value })}
                className="rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
              />
              <input
                type="number"
                placeholder="Prix"
                value={newRate.price}
                onChange={(e) => setNewRate({ ...newRate, price: parseFloat(e.target.value) })}
                min="0"
                step="0.01"
                className="rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddRate}
                className="button-primary"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-5">
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
            {formula ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FormulaModal;
