import { Pet } from "../models/pet";

export const getPet = async (id: string) => {
  return await Pet.findByPk(id);
};

export const createPet = async (data: any) => {
  return await Pet.create(data);
};

export const updatePet = async (id: string, data: any) => {
  const pet = await Pet.findByPk(id);
  if (!pet) throw new Error("Pet not found");
  await pet.update(data);
  return pet;
};

export const deletePet = async (id: string) => {
  const pet = await Pet.findByPk(id);
  if (!pet) throw new Error("Pet not found");
  await pet.destroy();
  return true;
};
