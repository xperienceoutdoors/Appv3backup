export interface ModificationRecord {
  id: string;
  date: Date;
  description: string;
  details?: string;
  user?: string;
}
