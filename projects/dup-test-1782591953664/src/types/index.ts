export interface TestRecord {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data?: T
  error?: {
    code: string
    message: string
  }
}
