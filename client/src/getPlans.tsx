import type { IPlan } from "../../shared/types";
import { API_URL } from './api/config';
export async function fetchUserPlans(): Promise<IPlan[]> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Please log in to load your plans");
    const response = await fetch(`${API_URL}/api/plans`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message === "User ID is missing in query") {
            throw new Error("The backend is running an outdated API. Redeploy the backend service, then log in again.");
        }
        throw new Error(errorData.message || "Failed to fetch plans");
    }
    const data = await response.json();
    const plans = data.plan || data;
    if (!Array.isArray(plans)) throw new Error("The server returned an invalid plans response");
    return [...plans].reverse();
}
