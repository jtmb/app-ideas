import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

export interface TestItem {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export async function fetchTestItems(params: ListParams = {}): Promise<TestItem[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/test-items`, { params });
    return response.data.items || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch test items: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

export async function fetchTestItemById(id: string): Promise<TestItem> {
  try {
    const response = await axios.get(`${API_BASE_URL}/test-items/${id}`);
    return response.data.item;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch test item: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

export async function createTestItem(data: Partial<TestItem>): Promise<TestItem> {
  try {
    const response = await axios.post(`${API_BASE_URL}/test-items`, data);
    return response.data.item;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create test item: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

export async function updateTestItem(id: string, data: Partial<TestItem>): Promise<TestItem> {
  try {
    const response = await axios.put(`${API_BASE_URL}/test-items/${id}`, data);
    return response.data.item;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to update test item: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}

export async function deleteTestItem(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/test-items/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete test item: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}
