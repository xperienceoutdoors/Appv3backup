import { Period } from '../types/business/Period';

const STORAGE_KEY = 'periods';

class PeriodService {
  async getAll(): Promise<Period[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const periods = JSON.parse(data);
      return Array.isArray(periods) ? periods : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des périodes:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Period | null> {
    const periods = await this.getAll();
    return periods.find(p => p.id === id) || null;
  }

  async create(period: Omit<Period, 'id'>): Promise<Period> {
    const periods = await this.getAll();
    
    const newPeriod: Period = {
      ...period,
      id: crypto.randomUUID(),
    };

    periods.push(newPeriod);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
    return newPeriod;
  }

  async update(id: string, period: Period): Promise<Period> {
    const periods = await this.getAll();
    const index = periods.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Period not found');

    periods[index] = { ...period, id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(periods));
    return periods[index];
  }

  async delete(id: string): Promise<void> {
    const periods = await this.getAll();
    const filteredPeriods = periods.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPeriods));
  }
}

export const periodService = new PeriodService();
export default periodService; 
