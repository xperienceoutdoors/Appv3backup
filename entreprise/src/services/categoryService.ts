import { Category, CategoryValidation } from '../types/business/Category';

const STORAGE_KEY = 'activity_categories'; // Changé pour éviter les conflits avec les anciennes catégories

const DEFAULT_CATEGORIES = [
  {
    id: '49de69b7-8483-4891-a424-f7fd32d1fc79',
    name: 'Kayak',
    description: 'Activités de kayak',
    order: 1,
    isActive: true
  }
];

const validateCategory = (category: Category): CategoryValidation => {
  const errors: string[] = [];
  let hasValidName = true;

  if (!category.name || category.name.trim().length === 0) {
    errors.push('Le nom est requis');
    hasValidName = false;
  }

  if (category.parentId) {
    try {
      // Vérifier que la catégorie parente existe
      const categories = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const parentExists = categories.some((c: Category) => c.id === category.parentId);
      if (!parentExists) {
        errors.push('La catégorie parente n\'existe pas');
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la catégorie parente:', error);
      errors.push('Erreur lors de la validation de la catégorie parente');
    }
  }

  return {
    hasValidName,
    errors
  };
};

export const categoryService = {
  initialize: async (): Promise<void> => {
    try {
      // Forcer la réinitialisation des catégories
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      console.log('Catégories initialisées:', DEFAULT_CATEGORIES);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des catégories:', error);
    }
  },

  getAll: async (): Promise<Category[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        await categoryService.initialize();
        return DEFAULT_CATEGORIES;
      }
      const categories = JSON.parse(data);
      return categories;
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Category | null> => {
    try {
      const categories = await categoryService.getAll();
      return categories.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la catégorie:', error);
      return null;
    }
  },

  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const categories = await categoryService.getAll();
      const newCategory = {
        ...category,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validation = validateCategory(newCategory);
      if (validation.errors.length > 0) {
        throw new Error(validation.errors.join(', '));
      }

      categories.push(newCategory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      return newCategory;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    }
  },

  update: async (id: string, category: Category): Promise<Category> => {
    try {
      const categories = await categoryService.getAll();
      const index = categories.findIndex(c => c.id === id);
      
      if (index === -1) {
        throw new Error('Catégorie non trouvée');
      }

      const updatedCategory = {
        ...categories[index],
        ...category,
        updatedAt: new Date(),
      };

      const validation = validateCategory(updatedCategory);
      if (validation.errors.length > 0) {
        throw new Error(validation.errors.join(', '));
      }

      categories[index] = updatedCategory;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      return updatedCategory;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    const categories = await categoryService.getAll();
    
    // Vérifier si la catégorie a des enfants
    const hasChildren = categories.some(c => c.parentId === id);
    if (hasChildren) {
      throw new Error('Impossible de supprimer une catégorie qui a des sous-catégories');
    }

    const filteredCategories = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCategories));
  },

  // Obtenir l'arborescence des catégories
  getTree: async (): Promise<Category[]> => {
    const categories = await categoryService.getAll();
    const rootCategories = categories.filter(c => !c.parentId);

    const buildTree = (parentId: string | undefined): Category[] => {
      return categories
        .filter(c => c.parentId === parentId)
        .sort((a, b) => a.order - b.order)
        .map(category => ({
          ...category,
          children: buildTree(category.id)
        }));
    };

    return buildTree(undefined);
  },

  // Réordonner les catégories
  reorder: async (categoryId: string, newOrder: number): Promise<void> => {
    const categories = await categoryService.getAll();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error('Catégorie non trouvée');
    }

    category.order = newOrder;
    await categoryService.update(categoryId, category);
  }
};
