import { Router, Request, Response } from 'express';

const router = Router();

interface StudySession {
  id: string;
  subjectId: string;
  userId: string;
  title: string;
  durationMinutes: number;
  date: string;
}

/**
 * Get all study sessions for a user
 * GET /api/v1/sessions
 */
router.get('/', (req: Request, res: Response) => {
  const sessions: StudySession[] = [
    {
      id: '1',
      subjectId: '1',
      userId: '1',
      title: 'Calculus Practice',
      durationMinutes: 60,
      date: new Date().toISOString(),
    },
    {
      id: '2',
      subjectId: '2',
      userId: '1',
      title: 'Physics Review',
      durationMinutes: 45,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Study sessions retrieved successfully',
    },
    data: sessions,
  });
});

/**
 * Get a single study session by ID
 * GET /api/v1/sessions/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const session: StudySession | null = sessions.find(s => s.id === id) || null;

  if (!session) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Study session with ID ${id} not found`,
      },
    });
  }

  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Study session retrieved successfully',
    },
    data: session,
  });
});

/**
 * Create a new study session
 * POST /api/v1/sessions
 */
router.post('/', (req: Request, res: Response) => {
  const { subjectId, title, durationMinutes } = req.body;

  if (!subjectId || !title || !durationMinutes) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Subject ID, title, and duration are required',
      },
    });
  }

  if (durationMinutes <= 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Duration must be greater than 0',
      },
    });
  }

  const newSession: StudySession = {
    id: Date.now().toString(),
    subjectId,
    userId: '1',
    title,
    durationMinutes,
    date: new Date().toISOString(),
  };

  res.status(201).json({
    error: {
      code: 'OK',
      message: 'Study session created successfully',
    },
    data: newSession,
  });
});

/**
 * Update a study session
 * PUT /api/v1/sessions/:id
 */
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, durationMinutes } = req.body;

  // TODO: Implement update logic
  res.status(200).json({
    error: {
      code: 'OK',
      message: 'Study session updated successfully',
    },
    data: { id, title, durationMinutes },
  });
});

/**
 * Delete a study session
 * DELETE /api/v1/sessions/:id
 */
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  // TODO: Implement delete logic
  res.status(204).send();
});

export default router;