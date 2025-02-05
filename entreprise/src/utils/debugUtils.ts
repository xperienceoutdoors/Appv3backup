import { Activity } from '../types/business/Activity';
import { Period } from '../types/business/Period';
import { Resource } from '../types/business/Resource';

export const debugStorage = {
  /**
   * Affiche le contenu du localStorage pour une clé donnée
   */
  inspectStorageItem(key: string): void {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        console.log(` [${key}] : Aucune donnée trouvée`);
        return;
      }

      try {
        const parsed = JSON.parse(data);
        console.log(` [${key}] :`, parsed);
      } catch (e) {
        console.log(` [${key}] : Données invalides (non-JSON)`, data);
      }
    } catch (e) {
      console.log(' Erreur d\'accès au localStorage:', e);
    }
  },

  /**
   * Vérifie et répare les périodes dans le localStorage
   */
  fixPeriods(): void {
    try {
      const periodsJson = localStorage.getItem('periods');
      if (!periodsJson) {
        console.log(' Aucune période trouvée');
        return;
      }

      let periods: Period[];
      try {
        periods = JSON.parse(periodsJson);
      } catch (e) {
        console.log(' Format JSON invalide pour les périodes');
        return;
      }

      if (!Array.isArray(periods)) {
        console.log(' Les périodes ne sont pas un tableau');
        localStorage.setItem('periods', '[]');
        return;
      }

      // Corriger les périodes
      const fixedPeriods = periods.map(period => ({
        ...period,
        id: period.id || crypto.randomUUID(),
        activities: Array.isArray(period.activities) ? period.activities : [],
        schedule: Array.isArray(period.schedule) ? period.schedule : [],
        startDate: period.startDate ? new Date(period.startDate) : new Date(),
        endDate: period.endDate ? new Date(period.endDate) : new Date(),
        name: period.name || 'Période sans nom',
        isOffPeak: !!period.isOffPeak
      }));

      localStorage.setItem('periods', JSON.stringify(fixedPeriods));
      console.log(' Périodes corrigées:', fixedPeriods);
    } catch (e) {
      console.log(' Erreur lors de la réparation des périodes:', e);
    }
  },

  /**
   * Vérifie et répare les activités dans le localStorage
   */
  fixActivities(): void {
    try {
      const activitiesJson = localStorage.getItem('activities');
      if (!activitiesJson) {
        console.log(' Aucune activité trouvée');
        return;
      }

      let activities: Activity[];
      try {
        activities = JSON.parse(activitiesJson);
      } catch (e) {
        console.log(' Format JSON invalide pour les activités');
        return;
      }

      if (!Array.isArray(activities)) {
        console.log(' Les activités ne sont pas un tableau');
        localStorage.setItem('activities', '[]');
        return;
      }

      // Corriger les activités
      const fixedActivities = activities.map(activity => ({
        ...activity,
        id: activity.id || crypto.randomUUID(),
        name: activity.name || 'Activité sans nom',
        description: activity.description || '',
        process: activity.process || '',
        goodToKnow: activity.goodToKnow || '',
        included: activity.included || '',
        shortDescription: activity.shortDescription || '',
        duration: {
          duration: activity.duration?.duration || 60,
          setupTime: activity.duration?.setupTime || 0,
          cleanupTime: activity.duration?.cleanupTime || 0
        },
        pricing: {
          basePrice: activity.pricing?.basePrice || 0,
          childPrice: activity.pricing?.childPrice,
          groupPrice: activity.pricing?.groupPrice,
          minParticipants: activity.pricing?.minParticipants
        },
        resources: Array.isArray(activity.resources) ? activity.resources : [],
        maxParticipants: activity.maxParticipants || 1,
        minParticipants: activity.minParticipants || 1,
        isActive: !!activity.isActive,
        isOnline: !!activity.isOnline,
        categories: Array.isArray(activity.categories) ? activity.categories : [],
        categoryId: activity.categoryId || null
      }));

      localStorage.setItem('activities', JSON.stringify(fixedActivities));
      console.log(' Activités corrigées:', fixedActivities);
    } catch (e) {
      console.log(' Erreur lors de la réparation des activités:', e);
    }
  },

  /**
   * Vérifie et répare les ressources dans le localStorage
   */
  fixResources(): void {
    try {
      const resourcesJson = localStorage.getItem('resources');
      if (!resourcesJson) {
        console.log(' Aucune ressource trouvée');
        return;
      }

      let resources: Resource[];
      try {
        resources = JSON.parse(resourcesJson);
      } catch (e) {
        console.log(' Format JSON invalide pour les ressources');
        return;
      }

      if (!Array.isArray(resources)) {
        console.log(' Les ressources ne sont pas un tableau');
        localStorage.setItem('resources', '[]');
        return;
      }

      // Corriger les ressources
      const fixedResources = resources.map(resource => ({
        ...resource,
        id: resource.id || crypto.randomUUID(),
        name: resource.name || 'Ressource sans nom',
        quantity: resource.quantity || 1,
        capacity: resource.capacity || 1
      }));

      localStorage.setItem('resources', JSON.stringify(fixedResources));
      console.log(' Ressources corrigées:', fixedResources);
    } catch (e) {
      console.log(' Erreur lors de la réparation des ressources:', e);
    }
  }
};
