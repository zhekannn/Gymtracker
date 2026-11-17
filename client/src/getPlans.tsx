import { IPlan } from "../../shared/types";
import { API_URL } from './api/config';
export async function fetchUserPlans(): Promise<IPlan[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Please log in to load your plans");
    const response = await fetch(`${API_URL}/api/plans`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch plans");
    }
    const data = await response.json();
    return (data.plan || data).reverse();
}
