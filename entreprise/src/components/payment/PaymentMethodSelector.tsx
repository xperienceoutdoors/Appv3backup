import { PaymentMethod } from '../../types/business/Activity';
import { RadioGroup } from '@headlessui/react';
import { CreditCardIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PaymentMethodSelectorProps {
  allowedMethods: PaymentMethod[];
  selectedMethod: PaymentMethod;
  totalAmount: number;
  depositPercentage: number;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({
  allowedMethods,
  selectedMethod,
  totalAmount,
  depositPercentage,
  onSelect
}: PaymentMethodSelectorProps) => {
  const depositAmount = (totalAmount * depositPercentage) / 100;

  const methods = [
    {
      id: 'full',
      name: 'Paiement complet',
      description: `Payer la totalité maintenant (${totalAmount}€)`,
      icon: CreditCardIcon,
      amount: totalAmount
    },
    {
      id: 'deposit',
      name: 'Acompte',
      description: `Payer ${depositPercentage}% maintenant (${depositAmount}€)`,
      icon: ClockIcon,
      amount: depositAmount
    },
    {
      id: 'onsite',
      name: 'Paiement sur place',
      description: 'Payer lors de l\'activité',
      icon: BanknotesIcon,
      amount: 0
    }
  ].filter(method => allowedMethods.includes(method.id as PaymentMethod));

  return (
    <RadioGroup value={selectedMethod} onChange={onSelect}>
      <RadioGroup.Label className="text-lg font-medium text-gray-900">
        Mode de paiement
      </RadioGroup.Label>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {methods.map((method) => (
          <RadioGroup.Option
            key={method.id}
            value={method.id}
            className={({ checked }) =>
              `${
                checked ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'
              } relative block cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none`
            }
          >
            {({ active, checked }) => (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-sm">
                      <RadioGroup.Label
                        as="p"
                        className="font-medium text-gray-900"
                      >
                        {method.name}
                      </RadioGroup.Label>
                      <RadioGroup.Description
                        as="p"
                        className="text-gray-500"
                      >
                        {method.description}
                      </RadioGroup.Description>
                    </div>
                  </div>
                  <method.icon
                    className={`h-5 w-5 ${
                      checked ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default PaymentMethodSelector;
