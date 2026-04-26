import keycloak from "utils/keycloak";
import { apiClient } from "./apiClient";

export const organizationApi = {
    getAll: (params: { page: number; size: number; name?: string; type?: string}) => {
        const cleanParams: any = {};
        
        cleanParams.page = params.page.toString();
        cleanParams.size = params.size.toString();
        
        if (params.name) cleanParams.name = params.name;
        if (params.type) cleanParams.type = params.type;

        const queryString = new URLSearchParams(cleanParams).toString();
        
        return apiClient(`/organizations?${queryString}`, { method: "GET" }); 
    },

    create: (payload: any) => {
        return apiClient('/organizations', { 
            method: 'POST',
            body: payload 
        });
    },

    updateStatus: (orgId: string, status: string) => {
        return apiClient(`/organizations/${orgId}/status`, { 
            method: "PATCH",
            body: JSON.stringify({ status: status })
        });
    },

    getById: (orgId: string) => {
        return apiClient(`/organizations/${orgId}`, { method: "GET" });
    },
    
    createFacility: (orgId: string, data: any) => {
        return apiClient(`/organizations/${orgId}/facilities`, {
            method: "POST",
            body: data,
        });
    },

    getFacilities: (orgId: string) => apiClient(`/organizations/${orgId}/facilities`, { method: "GET" }),

    getDocuments: (orgId: string) => {
        return apiClient(`/organizations/${orgId}/documents`, { method: "GET" });
    },

    getPreviewDocument: async (orgId: string, filename: string) => {
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const response = await fetch(`${BASE_URL}/organizations/${orgId}/documents/${filename}/preview`, {
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