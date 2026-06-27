import { useState, useEffect } from 'react'
import { TestRecord } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import RecordList from '../components/RecordList'

function Home() {
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
      const data = await response.json()
      setRecords(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Test Records</h1>
        <p className="mt-2 text-gray-600">
          A simple test application to demonstrate CRUD operations.
        </p>
      </div>

      {loading && <LoadingSpinner />}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {!loading && !error && records.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No records found. Create one to get started!</p>
        </div>
      )}
      {!loading && !error && records.length > 0 && (
        <RecordList records={records} onRefresh={fetchRecords} />
      )}
    </div>
  )
}

export default Home
