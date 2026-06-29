import { Router } from 'express';
import { AppError } from '../utils/AppError';

const router = Router();

// GET /study-sessions - Get all study sessions
router.get('/', (req, res) => {
  // TODO: Implement fetch all study sessions
  res.status(200).json([]);
});

// GET /study-sessions/:id - Get a specific study session
router.get('/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError('STUDY_SESSION_ID_REQUIRED', 'Study session ID is required.', 400);
  }
  // TODO: Implement fetch single study session
  res.status(200).json({ id });
});

// POST /study-sessions - Create a new study session
router.post('/', (req, res) => {
  const { subjectId, duration, notes } = req.body;
  if (!subjectId || !duration) {
    throw new AppError('SUBJECT_ID_OR_DURATION_REQUIRED', 'Subject ID and duration are required.', 400);
  }
  // TODO: Implement create study session
  res.status(201).json({ id: 'new', subjectId, duration });
});

// PUT /study-sessions/:id - Update a study session
router.put('/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError('STUDY_SESSION_ID_REQUIRED', 'Study session ID is required.', 400);
  }
  // TODO: Implement update study session
  res.status(200).json({ id, message: 'Updated' });
});

// DELETE /study-sessions/:id - Delete a study session
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new AppError('STUDY_SESSION_ID_REQUIRED', 'Study session ID is required.', 400);
  }
  // TODO: Implement delete study session
  res.status(204).send();
});

export default router;
