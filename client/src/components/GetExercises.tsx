import { API_URL } from '../api/config';
export async function getExes() {
      const response = await fetch(`${API_URL}/api/exercises`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch plans");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.exercises || data.data || []);
  }