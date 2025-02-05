import React, { useState } from 'react';
import { ReservationData } from '../ReservationModal';

interface PaymentStepProps {
  data: ReservationData;
  onUpdate: (data: Partial<ReservationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  // Example payment methods - In real app, fetch these from configuration
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: '💳',
      description: 'Paiement sécurisé par carte',
    },
    {
      id: 'onsite',
      name: 'Sur place',
      icon: '🏢',
      description: 'Paiement le jour de l\'activité',
    },
  ];

  // Calculate total amount
  const calculateTotal = () => {
    let total = 0;

    // Add formulas cost
    data.formulas?.forEach((formula) => {
      // In real app, fetch price from backend
      const price = formula.id === '1' ? 25 : formula.id === '2' ? 40 : 80;
      total += price * formula.quantity;
    });

    // Add options cost
    data.options?.forEach((option) => {
      // In real app, fetch price from backend
      const price = option.id === '1' ? 5 : option.id === '2' ? 3 : 10;
      total += price * option.quantity;
    });

    return total;
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleNext = () => {
    if (selectedMethod) {
      onUpdate({
        payment: {
          method: selectedMethod,
          amount: calculateTotal(),
        },
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Récapitulatif */}
      <div className="card">
        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4">
          Récapitulatif de la commande
        </h3>
        
        {/* Formules */}
        {data.formulas && data.formulas.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-[var(--primary-color)]">Formules</h4>
            {data.formulas.map((formula) => (
              <div key={formula.id} className="flex justify-between text-[var(--primary-color)]">
                <span>
                  {formula.name} × {formula.quantity}
                </span>
                <span className="font-medium">
                  {(formula.id === '1' ? 25 : formula.id === '2' ? 40 : 80) * formula.quantity}€
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Options */}
        {data.options && data.options.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="font-medium text-[var(--primary-color)]">Options</h4>
            {data.options.map((option) => (
              <div key={option.id} className="flex justify-between text-[var(--primary-color)]">
                <span>
                  {option.name} × {option.quantity}
                </span>
                <span className="font-medium">
                  {(option.id === '1' ? 5 : option.id === '2' ? 3 : 10) * option.quantity}€
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="border-t border-[var(--primary-color)] border-opacity-10 pt-4 mt-4">
          <div className="flex justify-between text-lg font-semibold text-[var(--primary-color)]">
            <span>Total</span>
            <span>{calculateTotal()}€</span>
          </div>
        </div>
      </div>

      {/* Méthodes de paiement */}
      <div>
        <h3 className="text-lg font-semibold text-[var(--primary-color)] mb-4">
          Choisissez votre moyen de paiement
        </h3>
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`card p-4 text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-[var(--accent-color)] bg-[var(--accent-color)] bg-opacity-5'
                  : 'hover:border-[var(--accent-color)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <h4 className="font-semibold text-[var(--primary-color)]">
                    {method.name}
                  </h4>
                  <p className="text-sm text-[var(--primary-color)] text-opacity-70">
                    {method.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="button-secondary">
          Retour
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedMethod}
          className="button-primary"
        >
          {selectedMethod === 'card' ? 'Procéder au paiement' : 'Confirmer la réservation'}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
