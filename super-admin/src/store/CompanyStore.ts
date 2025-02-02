import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company } from '../types/company';

interface CompanyStore {
  companies: Company[];
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      companies: [],
      addCompany: (company) =>
        set((state) => ({
          companies: [...state.companies, company]
        })),
      updateCompany: (company) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === company.id ? company : c
          )
        })),
      deleteCompany: (id) =>
        set((state) => ({
          companies: state.companies.filter((c) => c.id !== id)
        }))
    }),
    {
      name: 'company-storage'
    }
  )
);
