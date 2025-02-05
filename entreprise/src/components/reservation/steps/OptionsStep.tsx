import React, { useState, useEffect } from 'react';
import { ReservationData } from '../ReservationModal';
import optionalSaleService from '../../../services/optionalSaleService';
import { OptionalSale } from '../../../types/business/OptionalSale';

interface OptionsStepProps {
  data: ReservationData;
  onUpdate: (data: Partial<ReservationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const OptionsStep: React.FC<OptionsStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [selectedOptions, setSelectedOptions] = useState<Array<{ option: OptionalSale; quantity: number }>>(
    []
  );
  const [availableOptions, setAvailableOptions] = useState<OptionalSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      if (!data.activity?.id) return;

      try {
        const options = await optionalSaleService.getByActivity(data.activity.id);
        setAvailableOptions(options);
        
        // Initialiser les options sélectionnées depuis les données existantes
        if (data.options) {
          setSelectedOptions(
            data.options.map(opt => ({
              option: options.find(o => o.id === opt.option.id) || opt.option,
              quantity: opt.quantity
            }))
          );
        }
      } catch (error) {
        console.error('Error loading optional sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [data.activity?.id]);

  const handleQuantityChange = (option: OptionalSale, quantity: number) => {
    if (quantity === 0) {
      setSelectedOptions(prev => prev.filter(item => item.option.id !== option.id));
    } else {
      setSelectedOptions(prev => {
        const existing = prev.find(item => item.option.id === option.id);
        if (existing) {
          return prev.map(item =>
            item.option.id === option.id ? { ...item, quantity } : item
          );
        }
        return [...prev, { option, quantity }];
      });
    }
  };

  useEffect(() => {
    onUpdate({
      options: selectedOptions,
      totalPrice: calculateTotalPrice()
    });
  }, [selectedOptions]);

  const calculateTotalPrice = () => {
    const optionsPrice = selectedOptions.reduce(
      (total, { option, quantity }) => total + option.price * quantity,
      0
    );
    return (data.totalPrice || 0) + optionsPrice;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[var(--primary-color)]">
        Options additionnelles
      </h2>

      {availableOptions.length === 0 ? (
        <p className="text-gray-500">Aucune option disponible pour cette activité</p>
      ) : (
        <div className="space-y-4">
          {availableOptions.map((option) => (
            <div
              key={option.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{option.name}</h3>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  )}
                  <p className="text-sm font-medium text-[var(--primary-color)] mt-1">
                    {option.price.toFixed(2)} € {option.unit}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = selectedOptions.find(
                        (item) => item.option.id === option.id
                      )?.quantity || 0;
                      handleQuantityChange(option, Math.max(0, current - 1));
                    }}
                    className="button-secondary px-2 py-1"
                    disabled={!selectedOptions.find((item) => item.option.id === option.id)}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">
                    {selectedOptions.find((item) => item.option.id === option.id)?.quantity || 0}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = selectedOptions.find(
                        (item) => item.option.id === option.id
                      )?.quantity || 0;
                      handleQuantityChange(option, current + 1);
                    }}
                    className="button-secondary px-2 py-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-6">
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
          className="button-primary"
        >
          Continuer
        </button>
      </div>
    </div>
  );
};

export default OptionsStep;
