export interface Category {
  id: string;
  name: string;           // Nom de la catégorie
  description: string;    // Description
  parentId?: string;      // ID de la catégorie parente (pour les sous-catégories)
  order: number;          // Ordre d'affichage
  isActive: boolean;      // Si la catégorie est active
  imageUrl?: string;      // URL de l'image
  color?: string;         // Couleur pour l'affichage
  properties?: {          // Propriétés additionnelles
    [key: string]: string | number | boolean;
  };
}

// Pour la validation
export interface CategoryValidation {
  hasValidName: boolean;
  errors: string[];
}
