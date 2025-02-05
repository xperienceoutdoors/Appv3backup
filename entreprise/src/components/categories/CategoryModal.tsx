import React, { useState, useEffect } from 'react';
import { Category } from '../../types/business/Category';
import Modal from '../common/Modal';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category?: Category;
}

const defaultCategory: Partial<Category> = {
  name: '',
  description: '',
  order: 0,
  isActive: true,
  color: '#000000'
};

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
}) => {
  const [formData, setFormData] = useState<Partial<Category>>(defaultCategory);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData(defaultCategory);
    }
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name) {
      newErrors.push('Le nom est requis');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData as Category);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg">
            <ul className="list-disc list-inside text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="input-primary w-full"
            placeholder="ex: Sports nautiques"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="input-primary w-full h-32"
            placeholder="Description détaillée de la catégorie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Ordre d'affichage
          </label>
          <input
            type="number"
            value={formData.order || 0}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                order: parseInt(e.target.value),
              }))
            }
            className="input-primary w-full"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
            Couleur
          </label>
          <input
            type="color"
            value={formData.color || '#000000'}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                color: e.target.value,
              }))
            }
            className="input-primary w-full h-10"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isActive: e.target.checked,
              }))
            }
            className="mr-2"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-medium text-[var(--primary-color)]"
          >
            Catégorie active
          </label>
        </div>

        <div className="flex justify-end space-x-4">
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
            {category ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
