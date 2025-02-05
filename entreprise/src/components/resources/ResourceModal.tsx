import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Resource } from '../../types/business/Resource';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Partial<Resource>) => void;
  resource?: Resource;
}

const defaultFormData: Partial<Resource> = {
  name: '',
  description: '',
  totalQuantity: 1,
  capacity: undefined,
  isActive: true
};

const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  resource
}) => {
  const [formData, setFormData] = useState<Partial<Resource>>(defaultFormData);

  useEffect(() => {
    if (isOpen) {
      if (resource) {
        setFormData({
          name: resource.name,
          description: resource.description,
          totalQuantity: resource.totalQuantity,
          capacity: resource.capacity,
          isActive: resource.isActive
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [isOpen, resource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleClose = () => {
    setFormData(defaultFormData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={resource ? 'Modifier la ressource' : 'Nouvelle ressource'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Quantité totale */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantité totale
          </label>
          <input
            type="number"
            name="totalQuantity"
            value={formData.totalQuantity}
            onChange={handleInputChange}
            min={0}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Capacité */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Capacité (optionnel)
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity || ''}
            onChange={handleInputChange}
            min={0}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Statut */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Actif
          </label>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {resource ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResourceModal;
