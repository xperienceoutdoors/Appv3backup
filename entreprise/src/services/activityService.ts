import { Activity } from '../types/business/Activity';
import { Formula } from '../types/business/Formula';
import { Category } from '../types/business/Category';

const STORAGE_KEY = 'activities';

const activityService = {
  initialize: async (): Promise<void> => {
    const defaultActivities: Activity[] = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultActivities));
  },

  getAll: async (): Promise<Activity[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        await activityService.initialize();
        return [];
      }
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des activités:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Activity | null> => {
    const activities = await activityService.getAll();
    return activities.find(a => a.id === id) || null;
  },

  getByCategory: async (categoryId: string): Promise<Activity[]> => {
    const activities = await activityService.getAll();
    return activities.filter(a => a.categoryId === categoryId);
  },

  create: async (activityData: Omit<Activity, 'id'>): Promise<Activity> => {
    try {
      const activities = await activityService.getAll();
      
      const newActivity: Activity = {
        ...activityData,
        id: crypto.randomUUID(),
        isActive: true,
        isOnline: true,
        formulas: [],
        resources: []
      };

      activities.push(newActivity);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));

      return newActivity;
    } catch (error) {
      console.error('Erreur lors de la création de l\'activité:', error);
      throw new Error('Impossible de créer l\'activité');
    }
  },

  update: async (id: string, updates: Partial<Activity>): Promise<Activity> => {
    try {
      const activities = await activityService.getAll();
      const index = activities.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Activité non trouvée');

      activities[index] = {
        ...activities[index],
        ...updates
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
      return activities[index];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error);
      throw new Error('Impossible de mettre à jour l\'activité');
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const activities = await activityService.getAll();
      const filteredActivities = activities.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredActivities));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'activité:', error);
      throw new Error('Impossible de supprimer l\'activité');
    }
  },

  addFormula: async (activityId: string, formula: Formula): Promise<Activity> => {
    const activity = await activityService.getById(activityId);
    if (!activity) throw new Error('Activité non trouvée');

    const updatedFormulas = [...(activity.formulas || []), formula];
    return await activityService.update(activityId, { formulas: updatedFormulas });
  },

  updateFormula: async (activityId: string, formulaId: string, updates: Partial<Formula>): Promise<Activity> => {
    const activity = await activityService.getById(activityId);
    if (!activity) throw new Error('Activité non trouvée');

    const formulaIndex = activity.formulas?.findIndex(f => f.id === formulaId);
    if (formulaIndex === undefined || formulaIndex === -1) {
      throw new Error('Formule non trouvée');
    }

    const updatedFormulas = [...(activity.formulas || [])];
    updatedFormulas[formulaIndex] = {
      ...updatedFormulas[formulaIndex],
      ...updates
    };

    return await activityService.update(activityId, { formulas: updatedFormulas });
  },

  deleteFormula: async (activityId: string, formulaId: string): Promise<Activity> => {
    const activity = await activityService.getById(activityId);
    if (!activity) throw new Error('Activité non trouvée');

    const updatedFormulas = activity.formulas?.filter(f => f.id !== formulaId) || [];
    return await activityService.update(activityId, { formulas: updatedFormulas });
  }
};

export { activityService };
export default activityService;