export interface Subject {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  createdAt: Date;
  updatedAt: Date;
}