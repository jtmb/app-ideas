import { Router, Request, Response } from 'express'
import { getDatabase } from '../db'
import { z } from 'zod'

const router = Router()

// Validation schemas
const createRecordSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

const updateRecordSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
})

// GET /api/v1/records - List all records
router.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase()
    const result = db.exec('SELECT * FROM test_records ORDER BY created_at DESC')
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(200).json({ data: [] })
    }

    const columns = result[0].columns
    const rows = result[0].values.map((row: any[]) => {
      const record: any = {}
      columns.forEach((col, i) => {
        record[col] = row[i]
      })
      return record
    })

    res.json({ data: rows })
  } catch (error) {
    console.error('Error fetching records:', error)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch records' } })
  }
})

// GET /api/v1/records/:id - Get a single record
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const db = getDatabase()
    
    const result = db.exec(`SELECT * FROM test_records WHERE id = ${parseInt(id)}`)
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } })
    }

    const columns = result[0].columns
    const row = result[0].values[0]
    const record: any = {}
    columns.forEach((col, i) => {
      record[col] = row[i]
    })

    res.json({ data: record })
  } catch (error) {
    console.error('Error fetching record:', error)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch record' } })
  }
})

// POST /api/v1/records - Create a new record
router.post('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase()
    const validation = createRecordSchema.safeParse(req.body)
    
    if (!validation.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0].message } })
    }

    const { name, description } = validation.data
    const stmt = db.prepare('INSERT INTO test_records (name, description) VALUES (?, ?)')
    stmt.run([name, description || null])
    stmt.free()

    const result = db.exec('SELECT last_insert_rowid() as id')
    const newId = result[0].values[0][0]

    // Fetch the created record
    const recordResult = db.exec(`SELECT * FROM test_records WHERE id = ${newId}`)
    const columns = recordResult[0].columns
    const row = recordResult[0].values[0]
    const record: any = {}
    columns.forEach((col, i) => {
      record[col] = row[i]
    })

    res.status(201).json({ data: record })
  } catch (error) {
    console.error('Error creating record:', error)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to create record' } })
  }
})

// PUT /api/v1/records/:id - Update a record
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const db = getDatabase()
    const validation = updateRecordSchema.safeParse(req.body)
    
    if (!validation.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0].message } })
    }

    // Check if record exists
    const checkResult = db.exec(`SELECT * FROM test_records WHERE id = ${parseInt(id)}`)
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } })
    }

    const updates: string[] = []
    const params: any[] = []

    if (validation.data.name !== undefined) {
      updates.push('name = ?')
      params.push(validation.data.name)
    }
    if (validation.data.description !== undefined) {
      updates.push('description = ?')
      params.push(validation.data.description)
    }
    updates.push('updated_at = CURRENT_TIMESTAMP')

    const sql = `UPDATE test_records SET ${updates.join(', ')} WHERE id = ?`
    params.push(parseInt(id))

    db.run(sql, params)

    // Fetch the updated record
    const result = db.exec(`SELECT * FROM test_records WHERE id = ${parseInt(id)}`)
    const columns = result[0].columns
    const row = result[0].values[0]
    const record: any = {}
    columns.forEach((col, i) => {
      record[col] = row[i]
    })

    res.json({ data: record })
  } catch (error) {
    console.error('Error updating record:', error)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to update record' } })
  }
})

// DELETE /api/v1/records/:id - Delete a record
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const db = getDatabase()

    // Check if record exists
    const checkResult = db.exec(`SELECT * FROM test_records WHERE id = ${parseInt(id)}`)
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } })
    }

    db.run('DELETE FROM test_records WHERE id = ?', [parseInt(id)])

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting record:', error)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete record' } })
  }
})

export default router
