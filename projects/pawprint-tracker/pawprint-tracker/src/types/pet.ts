// Pet entity type definitions for PawPrint Tracker

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed?: string;
  age?: number; // in years
  gender?: Gender;
  weight?: number; // in kg
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Species = 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
export type Gender = 'male' | 'female' | 'unknown';

export interface PetCreateInput {
  ownerId: string;
  name: string;
  species: Species;
  breed?: string;
  age?: number;
  gender?: Gender;
  weight?: number;
  color?: string;
}

export interface PetUpdateInput extends Partial<PetCreateInput> {
  id: string;
}