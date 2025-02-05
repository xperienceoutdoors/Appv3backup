import { RealTimeAvailabilityService } from '../realTimeAvailabilityService';
import { Activity } from '../../types/business/Activity';
import { Resource } from '../../types/business/Resource';
import { Formula } from '../../types/business/Formula';
import { Period } from '../../types/business/Period';

describe('RealTimeAvailabilityService', () => {
  let service: RealTimeAvailabilityService;

  beforeEach(() => {
    service = new RealTimeAvailabilityService();
  });

  const mockActivity: Activity = {
    id: 'activity1',
    name: 'Test Activity',
    description: 'Test Description',
    process: 'Test Process',
    goodToKnow: 'Test Good to Know',
    included: 'Test Included',
    shortDescription: 'Test Short Description',
    duration: {
      duration: 60,
      setupTime: 15,
      cleanupTime: 15
    },
    pricing: {
      basePrice: 100
    },
    resources: [],
    formulas: [],
    isActive: true,
    maxParticipants: 10,
    isOnline: true,
    categories: [],
    paymentSettings: {
      depositRequired: false,
      depositAmount: 0,
      depositType: 'percentage'
    }
  };

  const mockResource: Resource = {
    id: 'resource1',
    name: 'Test Resource',
    description: 'Test Description',
    totalQuantity: 5,
    isActive: true,
    availability: []
  };

  const mockFormula: Formula = {
    id: 'formula1',
    name: 'Test Formula',
    description: 'Test Description',
    duration: 60,
    isActive: true,
    timeSlots: [{ time: '09:00' }, { time: '14:00' }],
    rates: [{
      id: 'rate1',
      name: 'Standard',
      price: 100,
      vat: 20,
      resources: [{
        resourceId: 'resource1',
        quantity: 1
      }]
    }]
  };

  describe('getAvailability', () => {
    it('should return available when no resources are required', async () => {
      const result = await service.getAvailability({
        activity: mockActivity,
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        periods: [],
        quantity: 1
      });

      expect(result.isAvailable).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should handle resource conflicts', async () => {
      const activityWithResource = {
        ...mockActivity,
        resources: [{
          resourceId: mockResource.id,
          quantity: 1
        }]
      };

      const result = await service.getAvailability({
        activity: activityWithResource,
        date: new Date(),
        startTime: '09:00',
        endTime: '10:00',
        periods: [],
        quantity: 6
      });

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('RESOURCE');
    });
  });

  describe('checkActivityAvailability', () => {
    it('should return available when no resources are required', async () => {
      const result = await service.checkActivityAvailability(
        mockActivity,
        mockFormula,
        new Date(),
        '09:00',
        '10:00',
        1
      );

      expect(result.isAvailable).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should handle resource conflicts', async () => {
      const result = await service.checkActivityAvailability(
        mockActivity,
        {
          ...mockFormula,
          rates: [{
            ...mockFormula.rates[0],
            resources: [{
              resourceId: mockResource.id,
              quantity: 6
            }]
          }]
        },
        new Date(),
        '09:00',
        '10:00',
        1
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0].type).toBe('RESOURCE');
    });
  });
});
