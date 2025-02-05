import { v4 as uuidv4 } from 'uuid';
import { Customer, CustomerContact } from '../types/business/Customer';
import { reservationService } from './reservationService';

const STORAGE_KEY = 'customers';

interface CustomerFilter {
  searchQuery?: string;
  status?: 'active' | 'inactive';
  sortBy?: 'name' | 'createdAt' | 'lastReservation' | 'totalSpent';
  sortOrder?: 'asc' | 'desc';
}

export const customerService = {
  async initialize(): Promise<void> {
    const defaultCustomers = [
      {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        contact: {
          email: 'jean.dupont@example.com',
          phone: '0612345678'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        stats: {
          totalReservations: 0,
          totalSpent: 0,
          lastReservation: null,
          averageReservationValue: 0
        }
      }
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCustomers));
  },

  async getAll(): Promise<Customer[]> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      await customerService.initialize();
      return customerService.getAll();
    }
    return JSON.parse(data);
  },

  async getById(id: string): Promise<Customer | null> {
    const customers = await customerService.getAll();
    return customers.find(c => c.id === id) || null;
  },

  async getByEmail(email: string): Promise<Customer | null> {
    const customers = await customerService.getAll();
    return customers.find(c => c.contact.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async create(customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Customer> {
    const existingCustomer = await this.getByEmail(customerData.contact.email);
    if (existingCustomer) {
      throw new Error('Un client avec cet email existe déjà');
    }

    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...customerData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      stats: {
        totalReservations: 0,
        totalSpent: 0,
        lastReservation: null,
        averageReservationValue: 0
      }
    };

    const customers = await this.getAll();
    customers.push(newCustomer);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));

    return newCustomer;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const customers = await this.getAll();
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Client non trouvé');
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updates.contact?.email && 
        updates.contact.email !== customers[index].contact.email) {
      const existingCustomer = await this.getByEmail(updates.contact.email);
      if (existingCustomer) {
        throw new Error('Un client avec cet email existe déjà');
      }
    }

    const updatedCustomer = {
      ...customers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    customers[index] = updatedCustomer;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));

    return updatedCustomer;
  },

  async delete(id: string): Promise<void> {
    const customers = await this.getAll();
    const filteredCustomers = customers.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCustomers));
  },

  async filter(options: CustomerFilter): Promise<Customer[]> {
    let customers = await this.getAll();

    // Filtrage par recherche
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      customers = customers.filter(c => 
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.contact.email.toLowerCase().includes(query) ||
        c.contact.phone.includes(query)
      );
    }

    // Filtrage par statut
    if (options.status) {
      customers = customers.filter(c => c.status === options.status);
    }

    // Tri
    if (options.sortBy) {
      customers.sort((a, b) => {
        let compareA: any;
        let compareB: any;

        switch (options.sortBy) {
          case 'name':
            compareA = `${a.lastName} ${a.firstName}`.toLowerCase();
            compareB = `${b.lastName} ${b.firstName}`.toLowerCase();
            break;
          case 'createdAt':
            compareA = new Date(a.createdAt).getTime();
            compareB = new Date(b.createdAt).getTime();
            break;
          case 'lastReservation':
            compareA = a.stats.lastReservation ? new Date(a.stats.lastReservation).getTime() : 0;
            compareB = b.stats.lastReservation ? new Date(b.stats.lastReservation).getTime() : 0;
            break;
          case 'totalSpent':
            compareA = a.stats.totalSpent;
            compareB = b.stats.totalSpent;
            break;
          default:
            return 0;
        }

        const comparison = compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        return options.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return customers;
  },

  async updateCustomerStats(customerId: string): Promise<void> {
    const customer = await this.getById(customerId);
    if (!customer) return;

    const reservations = await reservationService.getAll();
    const customerReservations = reservations.filter(r => 
      r.customer.email.toLowerCase() === customer.contact.email.toLowerCase()
    );

    const stats = {
      totalReservations: customerReservations.length,
      totalSpent: customerReservations.reduce((sum, r) => sum + r.totalPrice, 0),
      lastReservation: customerReservations.length > 0 
        ? customerReservations.sort((a, b) => 
            new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
          )[0].activityDate
        : undefined,
      averageReservationValue: customerReservations.length > 0
        ? customerReservations.reduce((sum, r) => sum + r.totalPrice, 0) / customerReservations.length
        : 0
    };

    await this.update(customerId, { stats });
  },

  async createOrUpdateFromReservation(customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<Customer> {
    const existingCustomer = await this.getByEmail(customerData.email);

    if (existingCustomer) {
      // Mettre à jour les informations si nécessaire
      const updates: Partial<Customer> = {
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        contact: {
          ...existingCustomer.contact,
          phone: customerData.phone
        }
      };

      const updated = await this.update(existingCustomer.id, updates);
      await this.updateCustomerStats(updated.id);
      return updated;
    } else {
      // Créer un nouveau client
      const newCustomer = await this.create({
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        contact: {
          email: customerData.email,
          phone: customerData.phone
        },
        status: 'active'
      });

      await this.updateCustomerStats(newCustomer.id);
      return newCustomer;
    }
  },

  async updateStats(customerId: string, reservation: any): Promise<void> {
    const customer = await customerService.getById(customerId);
    if (!customer) return;

    const stats = {
      totalReservations: customer.stats.totalReservations + 1,
      totalSpent: customer.stats.totalSpent + reservation.totalPrice,
      lastReservation: reservation.activityDate,
      averageReservationValue: (customer.stats.totalSpent + reservation.totalPrice) / (customer.stats.totalReservations + 1)
    };

    await customerService.update(customerId, { stats });
  }
};

export default customerService;
