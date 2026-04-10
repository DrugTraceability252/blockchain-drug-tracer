import keycloak from "utils/keycloak";

export const apiClient = async (url: string, options: any = {}) => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (keycloak && keycloak.token) {
        headers['Authorization'] = `Bearer ${keycloak.token}`;
    }

    const response = await fetch(`${BASE_URL}${url}`, { 
        ...options, 
        headers 
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
};