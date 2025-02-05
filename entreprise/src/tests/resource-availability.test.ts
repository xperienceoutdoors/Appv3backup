import { describe, it, expect, beforeEach } from 'vitest';
import { activityService } from '../../services/activityService';
import { resourceService } from '../../services/resourceService';
import { rateService } from '../../services/rateService';

describe('Resource Availability Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should manage resource availability through activity and rate creation', async () => {
    // Create an activity
    const activity = await activityService.create({
      id: "1",
      name: "Test Activity",
      description: "",
      process: "",
      goodToKnow: "",
      included: "",
      notIncluded: "",
      cancelConditions: "",
      duration: 60,
      minParticipants: 1,
      maxParticipants: 10,
      difficulty: "easy",
      location: "Test Location",
      isActive: true
    });

    // Create a resource
    const resource = await resourceService.create({
      id: "1",
      name: "Test Resource",
      description: "",
      totalQuantity: 10,
      availability: [],
      isActive: true
    });

    // Create a rate
    const rate = await rateService.create({
      id: "1",
      name: "Test Rate",
      price: 100,
      vat: 20,
      resources: [{
        resourceId: resource.id,
        quantity: 1
      }]
    });

    expect(activity).toBeDefined();
    expect(resource).toBeDefined();
    expect(rate).toBeDefined();
  });
});