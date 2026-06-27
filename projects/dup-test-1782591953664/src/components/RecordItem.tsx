import { TestRecord } from '../types'

interface RecordItemProps {
  record: TestRecord
  onEdit: () => void
  onDelete: () => void
}

function RecordItem({ record, onEdit, onDelete }: RecordItemProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-semibold text-gray-900">{record.name}</h3>
      <p className="mt-2 text-gray-600">{record.description}</p>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">
          Created: {new Date(record.createdAt).toLocaleDateString()}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default RecordItem
