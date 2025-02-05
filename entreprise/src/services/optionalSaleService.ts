import { v4 as uuidv4 } from 'uuid';
import { OptionalSale } from '../types/business/OptionalSale';

const STORAGE_KEY = 'optional_sales';

const optionalSaleService = {
  validateOptionalSale(optionalSale: OptionalSale): string[] {
    const errors: string[] = [];

    if (!optionalSale.name?.trim()) {
      errors.push('Le nom est requis');
    }

    if (optionalSale.price < 0) {
      errors.push('Le prix ne peut pas être négatif');
    }

    if (!optionalSale.type) {
      errors.push('Le type est requis');
    }

    if (!optionalSale.activities?.length) {
      errors.push('Au moins une activité doit être associée');
    }

    return errors;
  },

  async getAll(): Promise<OptionalSale[]> {
    const optionalSalesStr = localStorage.getItem(STORAGE_KEY);
    return optionalSalesStr ? JSON.parse(optionalSalesStr) : [];
  },

  async getById(id: string): Promise<OptionalSale | null> {
    const optionalSales = await this.getAll();
    return optionalSales.find(sale => sale.id === id) || null;
  },

  async create(optionalSale: Omit<OptionalSale, 'id'>): Promise<OptionalSale> {
    const errors = this.validateOptionalSale(optionalSale as OptionalSale);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const newOptionalSale: OptionalSale = {
      ...optionalSale,
      id: uuidv4(),
    };

    const optionalSales = await this.getAll();
    optionalSales.push(newOptionalSale);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(optionalSales));

    return newOptionalSale;
  },

  async update(id: string, optionalSale: OptionalSale): Promise<OptionalSale> {
    const errors = this.validateOptionalSale(optionalSale);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }

    const optionalSales = await this.getAll();
    const index = optionalSales.findIndex(sale => sale.id === id);

    if (index === -1) {
      throw new Error('Vente optionnelle non trouvée');
    }

    optionalSales[index] = optionalSale;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(optionalSales));

    return optionalSale;
  },

  async delete(id: string): Promise<void> {
    const optionalSales = await this.getAll();
    const filteredSales = optionalSales.filter(sale => sale.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSales));
  },

  async getByActivity(activityId: string): Promise<OptionalSale[]> {
    const optionalSales = await this.getAll();
    return optionalSales.filter(
      sale => sale.isActive && sale.activities.includes(activityId)
    );
  }
};

export default optionalSaleService;
