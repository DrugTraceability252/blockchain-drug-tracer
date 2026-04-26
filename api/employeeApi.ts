import keycloak from "utils/keycloak";
import { apiClient } from "./apiClient";

export const employeeApi = {
    getAll: (params: { orgId: string; page: number; size: number; search?: string; role?: string }) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        ) as Record<string, string>;
        
        const queryString = new URLSearchParams(cleanParams).toString();
        return apiClient(`/users?${queryString}`, { method: "GET" }); 
    },
};

export const authApi = {
    register: (userData: any) => {
        return apiClient(`/auth/register`, {
            method: "POST",
            body: userData
        });
    },
    approve: (userId: string) => {
        return apiClient(`/auth/approve/${userId}`, {
            method: "PATCH",
        });
    },

    getDocuments: (userId: string) => {
        return apiClient(`/users/${userId}/documents`, { method: "GET" });
    },

    getPreviewDocument: async (userId: string, filename: string) => {
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const response = await fetch(`${BASE_URL}/users/${userId}/documents/${filename}/preview`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${keycloak.token}` 
            }
        });

        if (!response.ok) {
            throw new Error(`Lỗi tải file: ${response.status}`);
        }

        return await response.blob();
    },
};