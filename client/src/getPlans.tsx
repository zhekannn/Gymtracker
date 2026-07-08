import { IPlan } from "../../shared/types";

export async function fetchUserPlans(): Promise<IPlan[]> {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        throw new Error("User not found in storage");
    }
    const user = JSON.parse(storedUser);
    const response = await fetch(`/api/plans?userId=${user.id}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch plans");
    }
    const data = await response.json();
    return (data.plan || data).reverse();
}