import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pet as PetType, Species, Gender } from '../types/pet';

@Entity('pets')
export class Pet implements PetType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  ownerId: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  species: Species;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  age?: number;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  /**
   * Create a new Pet instance from input data
   */
  static create(data: {
    id: string;
    ownerId: string;
    name: string;
    species: Species;
    breed?: string;
    age?: number;
    gender?: Gender;
    weight?: number;
    color?: string;
  }): Pet {
    const pet = new Pet();
    pet.id = data.id;
    pet.ownerId = data.ownerId;
    pet.name = data.name;
    pet.species = data.species;
    pet.breed = data.breed;
    pet.age = data.age;
    pet.gender = data.gender;
    pet.weight = data.weight;
    pet.color = data.color;
    return pet;
  }
}