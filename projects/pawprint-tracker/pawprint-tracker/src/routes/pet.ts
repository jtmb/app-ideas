import { Router } from "express";
import { getPet, createPet, updatePet, deletePet } from "../controllers/pet";

const router = Router();

router.get("/", async (req, res) => {
  const pets = await Pet.findAll();
  res.json(pets);
});

router.get("/:id", async (req, res) => {
  const pet = await getPet(req.params.id);
  if (!pet) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Pet not found" } });
  res.json(pet);
});

router.post("/", async (req, res) => {
  const pet = await createPet(req.body);
  res.status(201).json(pet);
});

router.put("/:id", async (req, res) => {
  const pet = await updatePet(req.params.id, req.body);
  res.json(pet);
});

router.delete("/:id", async (req, res) => {
  await deletePet(req.params.id);
  res.status(204).send();
});

export default router;
