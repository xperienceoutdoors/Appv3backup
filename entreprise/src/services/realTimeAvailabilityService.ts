import { Period } from '../types/business/Period';
import { Resource } from '../types/business/Resource';
import { Activity } from '../types/business/Activity';
import { ResourceAssignment } from '../types/business/ResourceAssignment';
import { Formula } from '../types/business/Formula';
import { resourceService } from './resourceService';
import { periodService } from './periodService';

interface AvailabilityResult {
  isAvailable: boolean;
  conflicts: Array<{
    type: 'PERIOD' | 'RESOURCE' | 'CAPACITY';
    message: string;
  }>;
  assignments?: ResourceAssignment[];
}

export class RealTimeAvailabilityService {
  private resourceAssignments: Map<string, ResourceAssignment[]> = new Map();

  constructor() {
    console.log('Périodes chargées:', this.loadPeriodsFromStorage());
  }

  private loadPeriodsFromStorage(): Period[] {
    try {
      const data = localStorage.getItem('periods');
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des périodes:', error);
      return [];
    }
  }

  private loadReservationsFromStorage(): Map<string, ResourceAssignment[]> {
    try {
      const data = localStorage.getItem('reservations');
      if (!data) return new Map();
      const reservations = JSON.parse(data);
      return new Map(Object.entries(reservations));
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      return new Map();
    }
  }

  private getResourcesForActivity(activityId: string): Resource[] {
    try {
      const resources = resourceService.getAll();
      // Pour l'instant, on retourne toutes les ressources
      // TODO: Filtrer les ressources par activité
      return resources;
    } catch (error) {
      console.error('Erreur lors du chargement des ressources:', error);
      return [];
    }
  }

  private isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2;
  }

  private getOptimalResourceIds(
    resourceType: string,
    quantityNeeded: number,
    startTime: string,
    endTime: string,
    existingAssignments: ResourceAssignment[],
    totalResources: number
  ): string[] {
    // Créer une map de toutes les périodes d'utilisation pour chaque ressource
    const resourceUsageMap = new Map<string, { periods: Array<{ start: string; end: string }> }>();
    
    // Initialiser la map pour toutes les ressources
    for (let i = 1; i <= totalResources; i++) {
      resourceUsageMap.set(`${resourceType}_${i}`, { periods: [] });
    }

    // Ajouter les périodes d'utilisation existantes
    existingAssignments.forEach(assignment => {
      const resource = resourceUsageMap.get(assignment.resourceId);
      if (resource) {
        resource.periods.push({
          start: assignment.startTime,
          end: assignment.endTime
        });
      }
    });

    // Trier les ressources par nombre de périodes d'utilisation (moins utilisées d'abord)
    const sortedResources = Array.from(resourceUsageMap.entries())
      .sort((a, b) => {
        // D'abord, vérifier si la ressource est disponible pour la période demandée
        const aAvailable = !a[1].periods.some(p => 
          this.isTimeOverlap(startTime, endTime, p.start, p.end)
        );
        const bAvailable = !b[1].periods.some(p => 
          this.isTimeOverlap(startTime, endTime, p.start, p.end)
        );

        if (aAvailable !== bAvailable) {
          return aAvailable ? -1 : 1;
        }

        // Ensuite, trier par nombre de périodes d'utilisation
        return a[1].periods.length - b[1].periods.length;
      });

    // Prendre les N premières ressources disponibles
    return sortedResources
      .filter(([_, usage]) => 
        !usage.periods.some(p => this.isTimeOverlap(startTime, endTime, p.start, p.end))
      )
      .slice(0, quantityNeeded)
      .map(([resourceId]) => resourceId);
  }

  async checkActivityAvailability(
    activity: Activity,
    formula: Formula,
    date: Date,
    startTime: string,
    endTime: string,
    participants: number
  ): Promise<AvailabilityResult> {
    try {
      // Vérifier si la période est ouverte
      const periods = await periodService.getAll();
      const activePeriod = periods.find(period => {
        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);
        const checkDate = new Date(date);
        return checkDate >= startDate && checkDate <= endDate;
      });

      if (!activePeriod) {
        return {
          isAvailable: false,
          conflicts: [{
            type: 'PERIOD',
            message: 'Aucune période d\'ouverture pour cette date'
          }]
        };
      }

      // Vérifier si le jour est ouvert dans la période
      const dayOfWeek = date.getDay() || 7; // 0 devient 7 pour dimanche
      const daySchedule = activePeriod.schedules[`day${dayOfWeek}`];
      
      if (!daySchedule?.isActive) {
        return {
          isAvailable: false,
          conflicts: [{
            type: 'PERIOD',
            message: 'Établissement fermé ce jour'
          }]
        };
      }

      // Vérifier si l'horaire est dans les heures d'ouverture
      if (startTime < daySchedule.startTime || endTime > daySchedule.endTime) {
        return {
          isAvailable: false,
          conflicts: [{
            type: 'PERIOD',
            message: 'Horaire en dehors des heures d\'ouverture'
          }]
        };
      }

      // Vérifier les ressources
      const resources = this.getResourcesForActivity(activity.id);
      const assignments: ResourceAssignment[] = [];

      for (const resource of resources) {
        const requiredQuantity = resource.totalQuantity;
        
        if (requiredQuantity > resource.totalQuantity) {
          return {
            isAvailable: false,
            conflicts: [{
              type: 'RESOURCE',
              message: `Pas assez de ${resource.name} disponibles (${resource.totalQuantity} disponibles, ${requiredQuantity} requis)`
            }]
          };
        }

        const existingAssignments = this.resourceAssignments.get(resource.id) || [];
        const optimalResourceIds = this.getOptimalResourceIds(
          resource.id,
          requiredQuantity,
          startTime,
          endTime,
          existingAssignments,
          resource.totalQuantity
        );

        if (optimalResourceIds.length < requiredQuantity) {
          return {
            isAvailable: false,
            conflicts: [{
              type: 'RESOURCE',
              message: `${resource.name} non disponible sur ce créneau`
            }]
          };
        }

        optimalResourceIds.forEach(resourceId => {
          assignments.push({
            resourceId,
            startTime,
            endTime,
            quantity: 1,
            reservationId: ''
          });
        });
      }

      return {
        isAvailable: true,
        conflicts: [],
        assignments
      };

    } catch (error) {
      console.error('Erreur lors de la vérification de la disponibilité:', error);
      return {
        isAvailable: false,
        conflicts: [{
          type: 'CAPACITY',
          message: 'Erreur lors de la vérification de la disponibilité'
        }]
      };
    }
  }
}

export const realTimeAvailabilityService = new RealTimeAvailabilityService();
