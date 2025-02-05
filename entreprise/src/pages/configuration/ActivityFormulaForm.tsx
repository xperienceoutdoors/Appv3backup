import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Activity, Formula } from '../../types/business/Activity';
import { activityService } from '../../services/activityService';
import { toast } from 'react-toastify';
import { Resource } from '../../types/business/Resource';
import resourceService from '../../services/resourceService';
import { Rate, RateResource } from '../../types/business/Formula';

const ActivityFormulaForm: React.FC = () => {
  const { activityId, formulaId } = useParams<{ activityId: string; formulaId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [formula, setFormula] = useState<Formula>({
    id: '',
    name: '',
    description: '',
    duration: 60,
    timeSlots: [],
    rates: [],
    isActive: true
  });

  // État pour la gestion des créneaux horaires
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [interval, setInterval] = useState(60);

  const [resources, setResources] = useState<Resource[]>([]);
  const [newRate, setNewRate] = useState<Partial<Rate>>({
    name: '',
    price: 0,
    vat: 20,
    resources: []
  });
  const [showResourcesSection, setShowResourcesSection] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!activityId) return;

      try {
        setIsLoading(true);
        const activityData = await activityService.get(activityId);
        if (!activityData) {
          throw new Error('Activité non trouvée');
        }
        // S'assurer que formulas est initialisé comme un tableau vide si non défini
        if (!activityData.formulas) {
          activityData.formulas = [];
        }

        // Initialiser le champ resources pour chaque tarif s'il n'existe pas
        activityData.formulas = activityData.formulas.map(formula => ({
          ...formula,
          rates: formula.rates.map(rate => ({
            ...rate,
            resources: rate.resources || []
          }))
        }));

        setActivity(activityData);

        if (formulaId) {
          const existingFormula = activityData.formulas?.find(f => f.id === formulaId);
          if (existingFormula) {
            setFormula(existingFormula);
          }
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        toast.error('Erreur lors du chargement de l\'activité');
      } finally {
        setIsLoading(false);
      }
    };

    const loadResources = async () => {
      try {
        const loadedResources = await resourceService.getAll();
        setResources(loadedResources);
      } catch (error) {
        console.error('Error loading resources:', error);
        toast.error('Erreur lors du chargement des ressources');
      }
    };

    loadData();
    loadResources();
  }, [activityId, formulaId]);

  const generateTimeSlots = () => {
    const slots: { time: string }[] = [];
    let current = new Date('2000-01-01T' + startTime);
    const end = new Date('2000-01-01T' + endTime);

    while (current <= end) {
      slots.push({
        time: current.toTimeString().substring(0, 5)
      });
      current = new Date(current.getTime() + interval * 60000);
    }

    setFormula(prev => ({
      ...prev,
      timeSlots: slots
    }));
  };

  const handleAddRate = () => {
    setFormula(prev => ({
      ...prev,
      rates: [
        ...prev.rates,
        {
          id: crypto.randomUUID(),
          name: '',
          price: 0,
          vat: 20,
          resources: []
        }
      ]
    }));
  };

  const handleRemoveRate = (id: string) => {
    setFormula(prev => ({
      ...prev,
      rates: prev.rates.filter(rate => rate.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity) return;

    try {
      const updatedFormula = {
        ...formula,
        id: formula.id || crypto.randomUUID()
      };

      const updatedFormulas = formula.id
        ? activity.formulas.map(f => (f.id === formula.id ? updatedFormula : f))
        : [...activity.formulas, updatedFormula];

      await activityService.update(activity.id, {
        ...activity,
        formulas: updatedFormulas
      });

      toast.success('Formule enregistrée avec succès');
      navigate(`/configuration/activities/${activityId}/formulas`);
    } catch (error) {
      console.error('Error saving formula:', error);
      toast.error('Erreur lors de l\'enregistrement de la formule');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/configuration/activities/${activityId}/formulas`)}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">
          {formulaId ? 'Modifier la formule' : 'Nouvelle formule'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom de la formule
              </label>
              <input
                type="text"
                id="name"
                value={formula.name}
                onChange={e => setFormula(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formula.description}
                onChange={e => setFormula(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Heures de départ */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Heures de départ</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Heure de début
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  Heure de fin
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700">
                  Intervalle (minutes)
                </label>
                <input
                  type="number"
                  id="interval"
                  value={interval}
                  onChange={e => setInterval(Number(e.target.value))}
                  min="15"
                  step="15"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={generateTimeSlots}
              className="button-primary"
            >
              Générer les créneaux
            </button>

            {/* Affichage des créneaux */}
            <div className="mt-4 flex flex-wrap gap-2">
              {formula.timeSlots.map((slot, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {slot.time}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Durée */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Durée</h2>
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Durée (minutes)
            </label>
            <input
              type="number"
              id="duration"
              value={formula.duration}
              onChange={e => setFormula(prev => ({ ...prev, duration: Number(e.target.value) }))}
              min="15"
              step="15"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
              required
            />
          </div>
        </div>

        {/* Tarifs */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Tarifs</h2>
          
          {/* Liste des tarifs existants */}
          <div className="space-y-4 mb-6">
            {formula.rates.map((rate, index) => (
              <div key={rate.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">{rate.name}</h3>
                    <p className="text-sm text-gray-500">{rate.price}€ (TVA {rate.vat}%)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormula(prev => ({
                        ...prev,
                        rates: prev.rates.filter((_, i) => i !== index)
                      }));
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Ressources du tarif */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Ressources nécessaires</h4>
                  <div className="space-y-2">
                    {(rate.resources || []).map((rateResource) => {
                      const resource = resources.find(r => r.id === rateResource.resourceId);
                      return resource ? (
                        <div key={rateResource.resourceId} className="flex items-center justify-between text-sm">
                          <span>{resource.name}</span>
                          <div className="flex items-center space-x-4">
                            <span>Quantité: {rateResource.quantity}</span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulaire d'ajout de tarif */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Ajouter un tarif</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={newRate.name}
                    onChange={e => setNewRate(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix</label>
                  <input
                    type="number"
                    value={newRate.price}
                    onChange={e => setNewRate(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">TVA (%)</label>
                  <input
                    type="number"
                    value={newRate.vat}
                    onChange={e => setNewRate(prev => ({ ...prev, vat: parseFloat(e.target.value) }))}
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                  />
                </div>
              </div>

              {/* Toggle pour les ressources */}
              <div className="flex items-center space-x-2">
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={showResourcesSection}
                    onChange={(e) => {
                      setShowResourcesSection(e.target.checked);
                      if (!e.target.checked) {
                        // Réinitialiser les ressources si on désactive la section
                        setNewRate(prev => ({ ...prev, resources: [] }));
                      }
                    }}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                      showResourcesSection ? 'bg-[var(--primary-color)]' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Attribuer des ressources
                </span>
              </div>

              {/* Sélection des ressources pour le nouveau tarif */}
              {showResourcesSection && (
                <div className="space-y-4">
                  {/* Liste des ressources attribuées */}
                  {newRate.resources && newRate.resources.length > 0 && (
                    <div className="space-y-2">
                      {newRate.resources.map((rateResource) => {
                        const resource = resources.find(r => r.id === rateResource.resourceId);
                        return resource ? (
                          <div key={resource.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <span className="text-sm font-medium">{resource.name}</span>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <label className="text-sm">Quantité:</label>
                                <input
                                  type="number"
                                  value={rateResource.quantity}
                                  onChange={(e) => {
                                    setNewRate(prev => ({
                                      ...prev,
                                      resources: prev.resources?.map(r =>
                                        r.resourceId === resource.id
                                          ? { ...r, quantity: parseInt(e.target.value) }
                                          : r
                                      )
                                    }));
                                  }}
                                  min="1"
                                  max={resource.totalQuantity}
                                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewRate(prev => ({
                                    ...prev,
                                    resources: prev.resources?.filter(r => r.resourceId !== resource.id)
                                  }));
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Menu déroulant pour sélectionner une ressource */}
                  <div className="relative">
                    <select
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] sm:text-sm"
                      value=""
                      onChange={(e) => {
                        const resourceId = e.target.value;
                        if (resourceId && !newRate.resources?.some(r => r.resourceId === resourceId)) {
                          setNewRate(prev => ({
                            ...prev,
                            resources: [
                              ...(prev.resources || []),
                              { resourceId, quantity: 1 }
                            ]
                          }));
                        }
                      }}
                    >
                      <option value="">Ressources</option>
                      {resources
                        .filter(resource => !newRate.resources?.some(r => r.resourceId === resource.id))
                        .map(resource => (
                          <option key={resource.id} value={resource.id}>
                            {resource.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (newRate.name && newRate.price !== undefined && newRate.vat !== undefined) {
                      setFormula(prev => ({
                        ...prev,
                        rates: [...prev.rates, {
                          id: crypto.randomUUID(),
                          name: newRate.name!,
                          price: newRate.price!,
                          vat: newRate.vat!,
                          resources: showResourcesSection ? (newRate.resources || []) : []
                        }]
                      }));
                      setNewRate({
                        name: '',
                        price: 0,
                        vat: 20,
                        resources: []
                      });
                      setShowResourcesSection(false); // Réinitialiser le toggle
                    }
                  }}
                  className="button-primary"
                >
                  Ajouter le tarif
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Options avancées */}
        <div className="bg-white shadow rounded-lg p-6">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex items-center justify-between w-full"
          >
            <h2 className="text-lg font-medium text-gray-900">Options avancées</h2>
            {showAdvancedOptions ? (
              <FiChevronUp className="w-5 h-5" />
            ) : (
              <FiChevronDown className="w-5 h-5" />
            )}
          </button>

          {showAdvancedOptions && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formula.isActive}
                  onChange={e => setFormula(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Formule active
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/configuration/activities/${activityId}/formulas`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-color)]"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="button-primary"
          >
            {formulaId ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActivityFormulaForm;
