import { IExercisesList } from "../../../shared/types";
export async function getExes() {
      const response = await fetch('/api/exercises');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch plans");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.exercises || data.data || []);
  }