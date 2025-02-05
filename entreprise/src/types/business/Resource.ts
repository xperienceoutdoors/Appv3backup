export interface Resource {
  id: string;
  name: string;          // Nom de la ressource
  description: string;   // Description détaillée
  totalQuantity: number; // Quantité totale disponible
  quantity?: number;     // Pour la compatibilité avec le service d'availability
  capacity?: number;    // Nombre de personnes par unité (optionnel)
  isActive: boolean;     // Si la ressource est actuellement utilisable
  availability: {
    date: string;
    quantity: number;
  }[];
}

// Interface interne pour la gestion des disponibilités
export interface ResourceAvailability {
  startDate: Date;        // Date de début de disponibilité
  endDate: Date;         // Date de fin de disponibilité
  quantity: number;      // Quantité disponible sur cette période
  reservationId?: string; // Lien vers la réservation
}
