import { apiClient } from "./apiClient";

export const organizationApi = {
    getAll: (params: { page: number; size: number; search?: string; orgType?: string }) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        ) as Record<string, string>;
        
        const queryString = new URLSearchParams(cleanParams).toString();
        return apiClient(`/organizations?${queryString}`, { method: "GET" }); 
    },

    create: (data: any) => {
        return apiClient(`/organizations`, {
            method: "POST",
            body: JSON.stringify(data),
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
    
};