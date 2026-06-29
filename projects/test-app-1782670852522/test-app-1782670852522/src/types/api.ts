// API request/response types for test-items endpoint

export interface PaginatedRequest {
  page?: number;
  limit?: number;
}

export interface TestItemResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTestItemsResponse {
  data: TestItemResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteItemRequest {
  id: string;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}