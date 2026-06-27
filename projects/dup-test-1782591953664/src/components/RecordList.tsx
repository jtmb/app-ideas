import { TestRecord } from '../types'
import RecordForm from './RecordForm'
import RecordItem from './RecordItem'

interface RecordListProps {
  records: TestRecord[]
  onRefresh: () => void
}

function RecordList({ records, onRefresh }: RecordListProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const handleEdit = (record: TestRecord) => {
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const response = await fetch(`/api/v1/records/${id}`, { method: 'DELETE' })
        if (!response.ok) {
          throw new Error('Failed to delete record')
        }
        onRefresh()
      } catch (err) {
        alert('Failed to delete record')
      }
    }
  }

  const handleSave = async (record: Partial<TestRecord>) => {
    try {
      if (editingId) {
        const response = await fetch(`/api/v1/records/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })
        if (!response.ok) throw new Error('Failed to update record')
      } else {
        const response = await fetch('/api/v1/records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        })
        if (!response.ok) throw new Error('Failed to create record')
      }
      setShowForm(false)
      setEditingId(null)
      onRefresh()
    } catch (err) {
      alert('Failed to save record')
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">{records.length} record(s)</p>
        <button
          onClick={() => { setEditingId(null); setShowForm(true) }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Record
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {records.map((record) => (
          <RecordItem
            key={record.id}
            record={record}
            onEdit={() => handleEdit(record)}
            onDelete={() => handleDelete(record.id)}
          />
        ))}
      </div>

      {showForm && (
        <div className="mt-8">
          <RecordForm
            initialData={editingId ? records.find((r) => r.id === editingId!) : undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingId(null) }}
          />
        </div>
      )}
    </div>
  )
}

export default RecordList
