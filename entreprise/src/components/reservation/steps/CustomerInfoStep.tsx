import React, { useState } from 'react';
import { ReservationData } from '../ReservationModal';

interface CustomerInfoStepProps {
  data: ReservationData;
  onUpdate: (data: Partial<ReservationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  birthDate?: string;
  notes?: string;
}

const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: data.customer?.firstName || '',
    lastName: data.customer?.lastName || '',
    email: data.customer?.email || '',
    phone: data.customer?.phone || '',
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const validateForm = () => {
    const newErrors: Partial<CustomerInfo> = {};
    
    if (!customerInfo.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!customerInfo.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!customerInfo.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }
    
    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\s-]{8,}$/.test(customerInfo.phone)) {
      newErrors.phone = 'Le numéro de téléphone n\'est pas valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onUpdate({
        customer: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
      });
      onNext();
    }
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Prénom *
          </label>
          <input
            type="text"
            value={customerInfo.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.firstName
                ? 'border-red-500'
                : 'border-[var(--primary-color)] border-opacity-10'
            } px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]`}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Nom *
          </label>
          <input
            type="text"
            value={customerInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.lastName
                ? 'border-red-500'
                : 'border-[var(--primary-color)] border-opacity-10'
            } px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]`}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Email *
          </label>
          <input
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.email
                ? 'border-red-500'
                : 'border-[var(--primary-color)] border-opacity-10'
            } px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Téléphone *
          </label>
          <input
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full rounded-lg border ${
              errors.phone
                ? 'border-red-500'
                : 'border-[var(--primary-color)] border-opacity-10'
            } px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Adresse
          </label>
          <input
            type="text"
            value={customerInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full rounded-lg border border-[var(--primary-color)] border-opacity-10 
                     px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
          />
        </div>

        {/* Code postal */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Code postal
          </label>
          <input
            type="text"
            value={customerInfo.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="w-full rounded-lg border border-[var(--primary-color)] border-opacity-10 
                     px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
          />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Ville
          </label>
          <input
            type="text"
            value={customerInfo.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full rounded-lg border border-[var(--primary-color)] border-opacity-10 
                     px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
          />
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Date de naissance
          </label>
          <input
            type="date"
            value={customerInfo.birthDate}
            onChange={(e) => handleInputChange('birthDate', e.target.value)}
            className="w-full rounded-lg border border-[var(--primary-color)] border-opacity-10 
                     px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Notes ou demandes particulières
          </label>
          <textarea
            value={customerInfo.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--primary-color)] border-opacity-10 
                     px-4 py-2 focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)]"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="button-secondary">
          Retour
        </button>
        <button onClick={handleSubmit} className="button-primary">
          Continuer
        </button>
      </div>
    </div>
  );
};

export default CustomerInfoStep;
