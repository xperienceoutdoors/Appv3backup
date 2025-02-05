import React, { useState, useEffect } from 'react';
import { Activity } from '../../types/business/Activity';
import { Customer } from '../../types/business/Customer';
import { Formula } from '../../types/business/Formula';
import { Reservation } from '../../types/business/Reservation';
import { Category } from '../../types/business/Category';
import { realTimeAvailabilityService } from '../../services/realTimeAvailabilityService';
import { reservationService } from '../../services/reservationService';
import { customerService } from '../../services/customerService';
import { activityService } from '../../services/activityService';
import { categoryService } from '../../services/categoryService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays, parse, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingCartIcon, UserPlusIcon, CreditCardIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

type Step = 'date' | 'category' | 'activity' | 'formula' | 'slots' | 'extras' | 'customer' | 'payment' | 'confirmation';

interface CartItem {
  activity: Activity;
  formula: Formula;
  date: Date;
  startTime: string;
  endTime: string;
  participants: number;
  price: number;
  extras?: any[];
}

const PointOfSale: React.FC = () => {
  // États
  const [currentStep, setCurrentStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [participants, setParticipants] = useState<number>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError(null);
        const allCategories = await categoryService.getAll();
        setCategories(allCategories.filter(c => c.isActive));
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Chargement des activités lors du changement de catégorie
  useEffect(() => {
    const loadActivities = async () => {
      if (!selectedCategory) {
        setActivities([]);
        return;
      }
      try {
        const categoryActivities = await activityService.getByCategory(selectedCategory);
        setActivities(categoryActivities);
      } catch (error) {
        console.error('Erreur lors du chargement des activités:', error);
        setError('Erreur lors du chargement des activités');
      }
    };
    loadActivities();
  }, [selectedCategory]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep('category');
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedActivity(null);
    setCurrentStep('activity');
  };

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setParticipants(activity.minParticipants || 1);
  };

  const handleFormulaSelect = async (formula: Formula) => {
    setSelectedFormula(formula);
    
    if (!selectedActivity) return;

    // Définir les créneaux possibles
    const timeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00'
    ];

    // Vérifier la disponibilité pour chaque créneau
    const availableTimeSlots: string[] = [];
    
    for (const startTime of timeSlots) {
      // Calculer l'heure de fin basée sur la durée de la formule
      const endTime = format(
        addMinutes(parse(startTime, 'HH:mm', new Date()), formula.duration),
        'HH:mm'
      );

      try {
        const availability = await realTimeAvailabilityService.checkActivityAvailability(
          selectedActivity,
          formula,
          selectedDate,
          startTime,
          endTime,
          participants
        );

        if (availability.isAvailable) {
          availableTimeSlots.push(`${startTime}-${endTime}`);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la disponibilité:', error);
      }
    }

    setAvailableSlots(availableTimeSlots);
    setCurrentStep('slots');
  };

  const handleParticipantsChange = (value: number) => {
    if (!selectedActivity) return;
    
    const minParticipants = selectedActivity.minParticipants || 1;
    const maxParticipants = selectedActivity.maxParticipants || 1;
    
    if (value < minParticipants) {
      value = minParticipants;
    } else if (value > maxParticipants) {
      value = maxParticipants;
    }
    
    setParticipants(value);
  };

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setCurrentStep('customer');
  };

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer);
    setCurrentStep('payment');
  };

  const handlePaymentSelect = (method: string) => {
    setPaymentMethod(method);
    setCurrentStep('confirmation');
  };

  const addToCart = () => {
    if (!selectedActivity || !selectedFormula || !selectedSlot) return;

    const [startTime, endTime] = selectedSlot.split('-');
    const newItem: CartItem = {
      activity: selectedActivity,
      formula: selectedFormula,
      date: selectedDate,
      startTime,
      endTime,
      participants,
      price: selectedFormula.price * participants
    };

    setCart([...cart, newItem]);
    setTotal(total + newItem.price);

    // Réinitialiser la sélection
    setSelectedActivity(null);
    setSelectedFormula(null);
    setSelectedSlot(null);
    setCurrentStep('date');
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    const removedItem = newCart.splice(index, 1)[0];
    setCart(newCart);
    setTotal(total - removedItem.price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-800">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Point de Vente</h1>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="mr-2">Étape :</span>
            <span className="font-medium">{currentStep}</span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Zone de sélection */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            {currentStep === 'date' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Sélectionnez une date</h2>
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  inline
                  locale={fr}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 60)}
                  dateFormat="dd/MM/yyyy"
                />
              </div>
            )}

            {currentStep === 'category' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Choisissez une catégorie</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="p-4 rounded-lg border hover:border-primary-500 hover:shadow-md transition-all"
                    >
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Choisissez une activité</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivitySelect(activity)}
                      className={`p-4 rounded-lg border ${
                        selectedActivity?.id === activity.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'hover:border-primary-500'
                      } hover:shadow-md transition-all`}
                    >
                      <h3 className="font-medium">{activity.name}</h3>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">
                          {activity.minParticipants === activity.maxParticipants
                            ? `${activity.minParticipants} participant${activity.minParticipants > 1 ? 's' : ''}`
                            : `${activity.minParticipants}-${activity.maxParticipants} participants`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'activity' && selectedActivity && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Nombre de participants</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleParticipantsChange(participants - 1)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    disabled={participants <= (selectedActivity.minParticipants || 1)}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-xl font-medium">{participants}</span>
                  <button
                    onClick={() => handleParticipantsChange(participants + 1)}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    disabled={participants >= (selectedActivity.maxParticipants || 1)}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Min: {selectedActivity.minParticipants || 1} - Max: {selectedActivity.maxParticipants || 1}
                </p>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Formules disponibles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedActivity.formulas?.map((formula) => (
                      <button
                        key={formula.id}
                        onClick={() => handleFormulaSelect(formula)}
                        className="p-4 rounded-lg border hover:border-primary-500 hover:shadow-md transition-all"
                      >
                        <h4 className="font-medium">{formula.name}</h4>
                        <p className="text-sm text-gray-500">{formula.description}</p>
                        <div className="mt-2">
                          <span className="font-medium text-primary-600">
                            {formula.price * participants}€
                          </span>
                          <span className="text-sm text-gray-500">
                            {' '}({formula.duration} min)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'slots' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Créneaux disponibles</h2>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500">Aucun créneau disponible pour cette date</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-4 rounded-lg border ${
                          selectedSlot === slot
                            ? 'bg-primary-100 border-primary-500 text-primary-700'
                            : 'bg-white border-gray-200 hover:border-primary-500'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 'customer' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Client</h2>
                {/* TODO: Ajouter la recherche et la sélection de client */}
              </div>
            )}

            {currentStep === 'payment' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Paiement</h2>
                {/* TODO: Ajouter les options de paiement */}
              </div>
            )}

            {currentStep === 'confirmation' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
                {/* TODO: Ajouter le récapitulatif et la confirmation */}
              </div>
            )}
          </div>

          {/* Panier */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Panier</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Votre panier est vide</p>
            ) : (
              <div>
                {cart.map((item, index) => (
                  <div key={index} className="mb-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{item.activity.name}</h3>
                        <p className="text-sm text-gray-500">{item.formula.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(item.date, 'dd/MM/yyyy')} {item.startTime}-{item.endTime}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.participants} participant{item.participants > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{item.price}€</span>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="block mt-2 text-sm text-red-500 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span>{total}€</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointOfSale;
