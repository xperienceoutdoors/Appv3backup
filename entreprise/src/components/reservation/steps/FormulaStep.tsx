import React, { useState, useEffect } from 'react';
import { Formula } from '../../../types/business/Formula';
import { formulaService } from '../../../services/formulaService';
import availabilityService from '../../../services/availabilityService';
import { toast } from 'react-toastify';

interface FormulaStepProps {
  data: {
    activity: {
      id: string;
      name: string;
      formulas?: Formula[];
    };
    date: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const FormulaStep: React.FC<FormulaStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFormulas();
  }, [data.activity?.id]);

  useEffect(() => {
    if (selectedFormula && data.date) {
      checkAvailability();
    }
  }, [selectedFormula, quantity, data.date]);

  const loadFormulas = async () => {
    if (!data.activity?.id) return;

    try {
      setLoading(true);
      const response = await formulaService.getAll();
      const activityFormulas = response.filter(
        (formula) => formula.activityId === data.activity.id
      );
      setFormulas(activityFormulas);
    } catch (error) {
      console.error('Error loading formulas:', error);
      setError('Erreur lors du chargement des formules');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!selectedFormula || !data.date || !data.activity) return;

    try {
      setLoading(true);
      const startTime = selectedFormula.timeSlots[0]?.time || '09:00';
      const endTime = availabilityService.calculateEndTime(startTime, selectedFormula.duration);
      
      const availability = await availabilityService.checkActivityAvailability(
        data.activity,
        selectedFormula,
        new Date(data.date),
        startTime,
        endTime,
        quantity
      );

      if (!availability.isAvailable) {
        const messages = availability.conflicts.map(c => c.message).join(', ');
        toast.error(`Ce créneau n'est pas disponible : ${messages}`);
        setSelectedFormula(null);
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      setError('Erreur lors de la vérification des disponibilités');
    } finally {
      setLoading(false);
    }
  };

  const handleFormulaSelect = (formula: Formula) => {
    setSelectedFormula(formula);
    onUpdate({
      formula,
      quantity
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (selectedFormula) {
      onUpdate({
        formula: selectedFormula,
        quantity: newQuantity
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Sélectionnez une formule</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          {formulas.map((formula) => (
            <div
              key={formula.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedFormula?.id === formula.id
                  ? 'border-[var(--primary-color)] bg-[var(--primary-color-light)]'
                  : 'border-gray-200 hover:border-[var(--primary-color)]'
              }`}
              onClick={() => handleFormulaSelect(formula)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{formula.name}</h3>
                  <p className="text-sm text-gray-500">{formula.description}</p>
                </div>
                <div className="text-right">
                  {formula.rates.map((rate, index) => (
                    <div key={rate.id} className="text-sm">
                      {index === 0 && <span className="font-medium">À partir de </span>}
                      {rate.price}€
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedFormula?.id === formula.id && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={formula.maxParticipants || 10}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="button-secondary"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedFormula}
          className="button-primary"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

export default FormulaStep;
