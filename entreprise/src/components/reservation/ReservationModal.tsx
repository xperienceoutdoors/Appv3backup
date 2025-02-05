import React, { useState } from 'react';
import Modal from '../common/Modal';
import DateActivityStep from './steps/DateActivityStep';
import FormulaStep from './steps/FormulaStep';
import OptionsStep from './steps/OptionsStep';
import CustomerInfoStep from './steps/CustomerInfoStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ReservationData {
  date?: Date;
  activity?: {
    id: string;
    name: string;
  };
  formulas?: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  timeSlot?: string;
  options?: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  payment?: {
    method: string;
    amount: number;
  };
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [reservationData, setReservationData] = useState<ReservationData>({});

  const steps = [
    {
      title: 'Date et Activité',
      component: DateActivityStep,
    },
    {
      title: 'Formule et Horaires',
      component: FormulaStep,
    },
    {
      title: 'Options',
      component: OptionsStep,
    },
    {
      title: 'Informations Client',
      component: CustomerInfoStep,
    },
    {
      title: 'Paiement',
      component: PaymentStep,
    },
    {
      title: 'Confirmation',
      component: ConfirmationStep,
    },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateReservationData = (data: Partial<ReservationData>) => {
    setReservationData((prev) => ({ ...prev, ...data }));
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle réservation">
      <div className="flex flex-col h-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index + 1 === currentStep
                    ? 'bg-[var(--accent-color)] text-white'
                    : index + 1 < currentStep
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-[var(--primary-color)] bg-opacity-10 text-[var(--primary-color)]'
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-full h-1 mx-2 ${
                    index + 1 < currentStep
                      ? 'bg-[var(--primary-color)]'
                      : 'bg-[var(--primary-color)] bg-opacity-10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <CurrentStepComponent
            data={reservationData}
            onUpdate={updateReservationData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReservationModal;
