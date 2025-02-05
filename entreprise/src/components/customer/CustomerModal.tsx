import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Customer } from '../../types/business/Customer';
import customerService from '../../services/customerService';
import { toast } from 'react-toastify';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSave: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'active' as const,
    notes: '',
    gdprConsent: {
      marketing: false
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.contact.email,
        phone: customer.contact.phone,
        status: customer.status,
        notes: customer.notes || '',
        gdprConsent: customer.gdprConsent || { marketing: false }
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'active',
        notes: '',
        gdprConsent: { marketing: false }
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (customer) {
        await customerService.update(customer.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          contact: {
            email: formData.email,
            phone: formData.phone
          },
          status: formData.status,
          notes: formData.notes,
          gdprConsent: formData.gdprConsent
        });
        toast.success('Client mis à jour avec succès');
      } else {
        await customerService.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          contact: {
            email: formData.email,
            phone: formData.phone
          },
          status: formData.status,
          notes: formData.notes,
          gdprConsent: formData.gdprConsent
        });
        toast.success('Client créé avec succès');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde du client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Modifier le client' : 'Nouveau client'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="input-primary mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="input-primary mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="input-primary mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="input-primary mt-1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
            className="input-primary mt-1"
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="input-primary mt-1"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="gdprMarketing"
            checked={formData.gdprConsent.marketing}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              gdprConsent: { ...prev.gdprConsent, marketing: e.target.checked }
            }))}
            className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <label htmlFor="gdprMarketing" className="ml-2 block text-sm text-gray-900">
            Accepte de recevoir des communications marketing
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="button-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="button-primary"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
