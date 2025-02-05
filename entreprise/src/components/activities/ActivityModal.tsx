import React, { useState, useEffect, useRef } from 'react';
import { Activity, ActivityDuration, ActivityPricing, PaymentType } from '../../types/business/Activity';
import { Resource } from '../../types/business/Resource';
import { Category } from '../../types/business/Category';
import resourceService from '../../services/resourceService';
import { categoryService } from '../../services/categoryService';
import Modal from '../common/Modal';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
  activity?: Activity;
}

const defaultDuration: ActivityDuration = {
  duration: 60, // Valeur par défaut d'une heure
};

const defaultPricing: ActivityPricing = {
  basePrice: 0,
};

const defaultActivity: Partial<Activity> = {
  name: '',
  description: '',
  shortDescription: '',
  process: '',
  goodToKnow: '',
  included: '',
  duration: defaultDuration,
  pricing: defaultPricing,
  resources: [],
  categories: [],
  maxParticipants: 10,
  isActive: true,
  isOnline: true,
  paymentType: 'onsite',
  allowedPaymentMethods: [],
};

const ActivityModal: React.FC<ActivityModalProps> = ({ isOpen, onClose, onSave, activity }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Activity>>(defaultActivity);

  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resourcesData, categoriesData] = await Promise.all([
          resourceService.getAll(),
          categoryService.getAll()
        ]);
        setResources(resourcesData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        duration: activity.duration || defaultDuration,
        pricing: activity.pricing || defaultPricing,
        resources: activity.resources || [],
        categories: activity.categories || [],
        allowedPaymentMethods: activity.allowedPaymentMethods || [],
      });
    } else {
      setFormData(defaultActivity);
    }
  }, [activity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // S'assurer que tous les champs requis sont présents
      const completeActivity = {
        ...defaultActivity,
        ...formData,
        id: formData.id || '', // S'assurer que l'ID est présent pour la mise à jour
        name: formData.name || '',
        description: formData.description || '',
        shortDescription: formData.shortDescription || '',
        process: formData.process || '',
        goodToKnow: formData.goodToKnow || '',
        included: formData.included || '',
        duration: formData.duration || defaultDuration,
        pricing: formData.pricing || defaultPricing,
        resources: formData.resources || [],
        categories: formData.categories || [],
        maxParticipants: formData.maxParticipants || 10,
        isActive: formData.isActive ?? true,
        isOnline: formData.isOnline ?? true,
        paymentType: formData.paymentType || 'onsite',
        allowedPaymentMethods: formData.allowedPaymentMethods || [],
      } as Activity;
      onSave(completeActivity);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.name) {
      newErrors.push('Le nom est requis');
    }

    if (!formData.categoryId) {
      newErrors.push('La catégorie principale est requise');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Modifier l\'activité' : 'Nouvelle activité'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erreurs */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 rounded-lg">
            <ul className="list-disc list-inside text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="border-b border-[var(--primary-color)] border-opacity-10">
          <nav className="flex space-x-4">
            {[
              { id: 'general', label: 'Général' },
              { id: 'description', label: 'Description' },
              { id: 'photo', label: 'Photo' },
              { id: 'pricing', label: 'Modalités de paiement' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium ${activeTab === tab.id
                  ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]'
                  : 'text-[var(--primary-color)] text-opacity-70 hover:text-opacity-100'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="space-y-6">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                    Nom de l'activité
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="input-primary w-full"
                    placeholder="ex: Cours de surf débutant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                    Catégorie principale
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    className="input-primary w-full"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Description courte
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                  className="input-primary w-full"
                  placeholder="Une brève description pour les listes"
                />
              </div>



              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-2">
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
                    className="w-4 h-4 text-[var(--primary-color)] rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-[var(--primary-color)]"
                  >
                    Activité active
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={formData.isOnline}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isOnline: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-[var(--primary-color)] rounded"
                  />
                  <label
                    htmlFor="isOnline"
                    className="text-sm font-medium text-[var(--primary-color)]"
                  >
                    Visible en ligne
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Description */}
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Description complète
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input-primary w-full h-32"
                  placeholder="Description détaillée de l'activité"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Déroulement de l'activité
                </label>
                <textarea
                  value={formData.process}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      process: e.target.value,
                    }))
                  }
                  className="input-primary w-full h-32"
                  placeholder="Décrivez le déroulement de l'activité"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Bon à savoir
                </label>
                <textarea
                  value={formData.goodToKnow}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      goodToKnow: e.target.value,
                    }))
                  }
                  className="input-primary w-full h-32"
                  placeholder="Informations importantes à connaître"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">
                  Inclus dans l'offre
                </label>
                <textarea
                  value={formData.included}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      included: e.target.value,
                    }))
                  }
                  className="input-primary w-full h-32"
                  placeholder="Ce qui est inclus dans l'offre"
                />
              </div>
            </div>
          )}

          {/* Onglet Photo */}
          {activeTab === 'photo' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--primary-color)] border-opacity-20 rounded-lg p-8 hover:border-opacity-40 transition-all">
                {formData.imageUrl ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={formData.imageUrl}
                      alt={formData.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, imageUrl: undefined, imageFile: undefined }))
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData((prev) => ({
                              ...prev,
                              imageUrl: reader.result as string,
                              imageFile: file,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center space-y-2 text-[var(--primary-color)] text-opacity-70 hover:text-opacity-100"
                    >
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>Cliquez pour ajouter une photo</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Onglet Modalités de paiement */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">
                  Modalités de paiement autorisées
                </label>
                <p className="text-sm text-[var(--primary-color)] text-opacity-70 mb-3">
                  Sélectionnez les modalités de paiement que vous souhaitez proposer à vos clients
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payment-onsite"
                      checked={formData.allowedPaymentMethods?.includes('onsite')}
                      onChange={(e) => {
                        const methods = formData.allowedPaymentMethods || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            allowedPaymentMethods: [...methods, 'onsite']
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            allowedPaymentMethods: methods.filter(m => m !== 'onsite')
                          }));
                        }
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    <label htmlFor="payment-onsite" className="text-sm text-[var(--primary-color)]">
                      Paiement sur place
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payment-deposit"
                      checked={formData.allowedPaymentMethods?.includes('deposit')}
                      onChange={(e) => {
                        const methods = formData.allowedPaymentMethods || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            allowedPaymentMethods: [...methods, 'deposit']
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            allowedPaymentMethods: methods.filter(m => m !== 'deposit')
                          }));
                        }
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    <label htmlFor="payment-deposit" className="text-sm text-[var(--primary-color)]">
                      Acompte
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payment-full"
                      checked={formData.allowedPaymentMethods?.includes('full')}
                      onChange={(e) => {
                        const methods = formData.allowedPaymentMethods || [];
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            allowedPaymentMethods: [...methods, 'full']
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            allowedPaymentMethods: methods.filter(m => m !== 'full')
                          }));
                        }
                      }}
                      className="w-4 h-4 mr-2"
                    />
                    <label htmlFor="payment-full" className="text-sm text-[var(--primary-color)]">
                      Paiement intégral
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons */}
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
            {activity ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ActivityModal;
