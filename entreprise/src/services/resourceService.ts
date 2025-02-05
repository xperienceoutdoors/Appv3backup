import { Resource } from '../types/business/Resource';
import { isWithinInterval } from 'date-fns';

const STORAGE_KEY = 'resources';

const validateResource = (resource: Resource): string[] => {
  const errors: string[] = [];

  if (!resource.name?.trim()) {
    errors.push('Le nom est requis');
  }

  if (resource.totalQuantity === undefined || resource.totalQuantity < 0) {
    errors.push('La quantité totale doit être un nombre positif');
  }

  if (resource.capacity !== undefined && resource.capacity < 0) {
    errors.push('La capacité doit être un nombre positif');
  }

  return errors;
};

class ResourceService {
  async getAll(): Promise<Resource[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const resources = JSON.parse(data);
      return Array.isArray(resources) ? resources : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des ressources:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Resource | null> {
    const resources = await this.getAll();
    return resources.find(r => r.id === id) || null;
  }

  async create(resource: Omit<Resource, 'id'>): Promise<Resource> {
    const resources = await this.getAll();
    const errors = validateResource(resource as Resource);
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const newResource: Resource = {
      ...resource,
      id: crypto.randomUUID(),
    };

    resources.push(newResource);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    return newResource;
  }

  async update(id: string, resource: Resource): Promise<Resource> {
    const resources = await this.getAll();
    const errors = validateResource(resource);
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const index = resources.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Resource not found');

    resources[index] = { ...resource, id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    return resources[index];
  }

  async delete(id: string): Promise<void> {
    const resources = await this.getAll();
    const filteredResources = resources.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredResources));
  }

  async getAvailableResources(startDate: Date, endDate: Date): Promise<Resource[]> {
    const resources = await this.getAll();
    return resources.filter(resource => {
      if (!resource.isActive) return false;
      if (!resource.availability || resource.availability.length === 0) {
        return true;
      }
      const availableQuantity = resource.availability.reduce((total, availability) => {
        const availabilityDate = new Date(availability.date);
        if (isWithinInterval(availabilityDate, { start: startDate, end: endDate })) {
          return total + availability.quantity;
        }
        return total;
      }, 0);
      return availableQuantity > 0;
    });
  }

  async getAvailableQuantity(resourceId: string, startDate: Date, endDate: Date): Promise<number> {
    const resource = await this.getById(resourceId);
    if (!resource) throw new Error('Resource not found');
    if (!resource.isActive) return 0;

    if (!resource.availability || resource.availability.length === 0) {
      return resource.totalQuantity;
    }

    return resource.availability.reduce((total, availability) => {
      const availabilityDate = new Date(availability.date);
      if (isWithinInterval(availabilityDate, { start: startDate, end: endDate })) {
        return total + availability.quantity;
      }
      return total;
    }, 0);
  }

  async updateAvailability(resourceId: string, date: Date, quantity: number): Promise<void> {
    const resources = await this.getAll();
    const index = resources.findIndex(r => r.id === resourceId);
    if (index === -1) throw new Error('Resource not found');

    const resource = resources[index];
    if (!resource.availability) {
      resource.availability = [];
    }

    resource.availability.push({
      date: date.toISOString(),
      quantity
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }

  async removeAvailability(resourceId: string, date: string): Promise<void> {
    const resources = await this.getAll();
    const index = resources.findIndex(r => r.id === resourceId);
    if (index === -1) throw new Error('Resource not found');

    const resource = resources[index];
    if (resource.availability) {
      resource.availability = resource.availability.filter(
        a => a.date !== date
      );
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  }
}

export const resourceService = new ResourceService();
export default resourceService;

