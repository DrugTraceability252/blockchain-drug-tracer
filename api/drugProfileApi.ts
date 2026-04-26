import { apiClient } from "./apiClient";
import keycloak from "utils/keycloak";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const drugProfileApi = {
    getAll: (params: { page: number; size: number; manufacturerOrgId?: string; drugType?: string | null }) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        ) as Record<string, string>;
        
        const queryString = new URLSearchParams(cleanParams).toString();
        return apiClient(`/drug-profiles?${queryString}`, { method: "GET" });
    },

    getById: (drugId: string) => {
        return apiClient(`/drug-profiles/${drugId}`, { method: "GET" });
    },

    create: (data: any) => {
        return apiClient(`/drug-profiles`, { 
            method: "POST", 
            body: data
        });
    },

    updateStatus: (drugId: string, status: string) => {
        return apiClient(`/drug-profiles/${drugId}/status?status=${status}`, {
            method: "PATCH" 
        });
    },

    createWithFiles: (formData: FormData) => {
        return apiClient(`/drug-profiles`, { 
            method: "POST", 
            body: formData 
        });
    },

    getDocuments: (drugId: string) => {
        return apiClient(`/drug-profiles/${drugId}/documents`, { method: "GET" });
    },

    getPreviewDocument: async (drugId: string, filename: string) => {
        const headers: Record<string, string> = {};
        if (keycloak && keycloak.token) {
            headers['Authorization'] = `Bearer ${keycloak.token}`;
        }

        const response = await fetch(`${BASE_URL}/drug-profiles/${drugId}/documents/${filename}/preview`, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            throw new Error(`Lỗi tải file: ${response.status}`);
        }

        return await response.blob();
    }
};