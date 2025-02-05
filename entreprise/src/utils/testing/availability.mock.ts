import { Activity } from '../../types/business/Activity';
import { Period } from '../../types/business/Period';
import { Resource } from '../../types/business/Resource';
import { Formula } from '../../types/business/Formula';
import { AvailabilityConfig } from '../../types/business/AvailabilityConfig';

// Données de test pour les activités
export const mockActivity: Activity = {
  id: 'activity1',
  name: 'Cours de Tennis',
  description: 'Cours de tennis pour débutants et intermédiaires',
  categoryId: 'category1',
  isActive: true,
  defaultDuration: 60,
};

// Configuration des disponibilités
export const mockAvailabilityConfig: AvailabilityConfig = {
  activityId: 'activity1',
  timeSlots: {
    defaultDuration: 60,
    minStartTime: '09:00',
    maxEndTime: '18:00',
    intervalMinutes: 30,
    bufferMinutes: 15,
  },
  maxParticipantsPerSlot: 4,
  minParticipantsPerSlot: 1,
  maxAdvanceBookingDays: 30,
  minAdvanceBookingHours: 2,
  resourceRules: [
    {
      resourceId: 'resource1',
      maxConcurrentBookings: 1,
      minTimeBetweenBookings: 15,
      quantityPerBooking: 1,
    },
  ],
  allowOverlapping: false,
  maxOverlappingBookings: 0,
  seasonalRules: [
    {
      periodId: 'period1',
      timeSlotOverrides: {
        minStartTime: '08:00',
        maxEndTime: '20:00',
      },
      maxParticipantsOverride: 6,
    },
  ],
  dynamicPricing: {
    peakHourMultiplier: 1.5,
    lastMinuteDiscount: 20,
    earlyBirdDiscount: 15,
  },
};

// Périodes
export const mockPeriods: Period[] = [
  {
    id: 'period1',
    name: 'Haute Saison',
    startDate: new Date('2025-07-01'),
    endDate: new Date('2025-08-31'),
    activities: ['activity1'],
    schedule: [
      {
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        dayOfWeek: 4,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        dayOfWeek: 5,
        startTime: '09:00',
        endTime: '18:00',
        isActive: true,
      },
      {
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        dayOfWeek: 7,
        startTime: '10:00',
        endTime: '16:00',
        isActive: true,
      },
    ],
    isOffPeak: false,
  },
  {
    id: 'period2',
    name: 'Basse Saison',
    startDate: new Date('2025-09-01'),
    endDate: new Date('2025-06-30'),
    activities: ['activity1'],
    schedule: [
      {
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        dayOfWeek: 3,
        startTime: '10:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        dayOfWeek: 4,
        startTime: '10:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        dayOfWeek: 5,
        startTime: '10:00',
        endTime: '17:00',
        isActive: true,
      },
      {
        dayOfWeek: 6,
        startTime: '10:00',
        endTime: '16:00',
        isActive: false,
      },
      {
        dayOfWeek: 7,
        startTime: '10:00',
        endTime: '16:00',
        isActive: false,
      },
    ],
    isOffPeak: true,
  },
];

// Ressources
export const mockResources: Resource[] = [
  {
    id: 'resource1',
    name: 'Court de Tennis',
    description: 'Court de tennis en terre battue',
    quantity: 4,
    isActive: true,
  },
];

// Formules
export const mockFormulas: Formula[] = [
  {
    id: 'formula1',
    name: 'Cours Particulier',
    activityId: 'activity1',
    basePrice: 50,
    description: 'Cours particulier avec un professeur',
    duration: 60,
    maxParticipants: 1,
    minParticipants: 1,
  },
  {
    id: 'formula2',
    name: 'Cours Collectif',
    activityId: 'activity1',
    basePrice: 25,
    description: 'Cours en groupe',
    duration: 60,
    maxParticipants: 4,
    minParticipants: 2,
  },
];
