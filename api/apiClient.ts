import keycloak from "utils/keycloak";

export const apiClient = async (url: string, options: any = {}) => {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const headers: Record<string, string> = {
        ...(options.headers || {}),
    };

    if (keycloak && keycloak.token) {
        headers['Authorization'] = `Bearer ${keycloak.token}`;
    }

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    } else {
        if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }
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