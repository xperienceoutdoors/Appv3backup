import { Formula } from '../types/business/Formula';

class FormulaService {
  private readonly STORAGE_KEY = 'formulas';

  async getAll(): Promise<Formula[]> {
    const formulasJson = localStorage.getItem(this.STORAGE_KEY);
    if (!formulasJson) {
      return [];
    }
    return JSON.parse(formulasJson);
  }

  async get(id: string): Promise<Formula | null> {
    const formulas = await this.getAll();
    const formula = formulas.find(f => f.id === id);
    return formula || null;
  }

  async create(formula: Omit<Formula, 'id'>): Promise<Formula> {
    const newFormula: Formula = {
      ...formula,
      id: crypto.randomUUID()
    };

    const formulas = await this.getAll();
    formulas.push(newFormula);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formulas));

    return newFormula;
  }

  async update(id: string, formula: Partial<Formula>): Promise<Formula | null> {
    const formulas = await this.getAll();
    const index = formulas.findIndex(f => f.id === id);
    
    if (index === -1) {
      return null;
    }

    const updatedFormula = {
      ...formulas[index],
      ...formula
    };

    formulas[index] = updatedFormula;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(formulas));

    return updatedFormula;
  }

  async delete(id: string): Promise<boolean> {
    const formulas = await this.getAll();
    const filteredFormulas = formulas.filter(f => f.id !== id);
    
    if (filteredFormulas.length === formulas.length) {
      return false;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredFormulas));
    return true;
  }
}

export const formulaService = new FormulaService();
export default formulaService;
