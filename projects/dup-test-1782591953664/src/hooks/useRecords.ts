import { useState, useEffect } from 'react'
import { TestRecord, ApiResponse } from '../types'

interface UseRecordsReturn {
  records: TestRecord[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  create: (record: Partial<TestRecord>) => Promise<void>
  update: (id: number, record: Partial<TestRecord>) => Promise<void>
  delete: (id: number) => Promise<void>
}

export function useRecords(): UseRecordsReturn {
  const [records, setRecords] = useState<TestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/v1/records')
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }
      const data: ApiResponse<TestRecord[]> = await response.json()
      setRecords(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createRecord = async (record: Partial<TestRecord>) => {
    try {
      const response = await fetch('/api/v1/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      if (!response.ok) {
        throw new Error('Failed to create record')
      }
      const data: ApiResponse<TestRecord> = await response.json()
      setRecords((prev) => [data.data!, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const updateRecord = async (id: number, record: Partial<TestRecord>) => {
    try {
      const response = await fetch(`/api/v1/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      })
      if (!response.ok) {
        throw new Error('Failed to update record')
      }
      const data: ApiResponse<TestRecord> = await response.json()
      setRecords((prev) => prev.map((r) => (r.id === id ? data.data! : r)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  const deleteRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/records/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Failed to delete record')
      }
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return { records, loading, error, refresh: fetchRecords, create: createRecord, update: updateRecord, delete: deleteRecord }
}
