import { Router, Request, Response } from 'express';

const router = Router();

interface Subject {
  id: string;
  name: string;
  description?: string;
}

/**
 * Get all subjects
 * GET /api/v1/subjects
 */
router.get('/', (req: Request, res: Response) => {
  const subjects: Subject[] = [
    { id: '1', name: 'Mathematics', description: 'Calculus and Algebra' },
    { id: '2', name: 'Physics', description: 'Mechanics and Thermodynamics' },
    { id: '3', name: 'Computer Science', description: 'Data Structures and Algorithms' },
  ];

  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Subjects retrieved successfully',
    },
    data: subjects,
  });
});

/**
 * Get a single subject by ID
 * GET /api/v1/subjects/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const subject: Subject | null = subjects.find(s => s.id === id) || null;

  if (!subject) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Subject with ID ${id} not found`,
      },
    });
  }

  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Subject retrieved successfully',
    },
    data: subject,
  });
});

/**
 * Create a new subject
 * POST /api/v1/subjects
 */
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Subject name is required',
      },
    });
  }

  const newSubject: Subject = {
    id: Date.now().toString(),
    name,
    description,
  };

  res.status(201).json({
    error: {
      code: 'OK',
      message: 'Subject created successfully',
    },
    data: newSubject,
  });
});

/**
 * Update a subject
 * PUT /api/v1/subjects/:id
 */
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  // TODO: Implement update logic
  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Subject updated successfully',
    },
    data: { id, name, description },
  });
});

/**
 * Delete a subject
 * DELETE /api/v1/subjects/:id
 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Implement delete logic
  res.status(204).send();
});

export default router;
