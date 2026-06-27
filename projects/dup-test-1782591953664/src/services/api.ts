import { TestRecord, ApiResponse } from '../types'

const API_BASE = '/api/v1'

export const api = {
  async getRecords(): Promise<ApiResponse<TestRecord[]>> {
    const response = await fetch(`${API_BASE}/records`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.error || { code: 'UNKNOWN_ERROR', message: response.statusText } }
    }
    return response.json()
  },

  async getRecord(id: number): Promise<ApiResponse<TestRecord>> {
    const response = await fetch(`${API_BASE}/records/${id}`)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.error || { code: 'NOT_FOUND', message: 'Record not found' } }
    }
    return response.json()
  },

  async createRecord(record: Partial<TestRecord>): Promise<ApiResponse<TestRecord>> {
    const response = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.error || { code: 'CREATION_FAILED', message: 'Failed to create record' } }
    }
    return response.json()
  },

  async updateRecord(id: number, record: Partial<TestRecord>): Promise<ApiResponse<TestRecord>> {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.error || { code: 'UPDATE_FAILED', message: 'Failed to update record' } }
    }
    return response.json()
  },

  async deleteRecord(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE}/records/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { error: errorData.error || { code: 'DELETION_FAILED', message: 'Failed to delete record' } }
    }
    return { data: undefined }
  },
}
