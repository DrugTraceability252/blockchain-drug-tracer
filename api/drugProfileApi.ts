import { apiClient } from "./apiClient";

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
            body: JSON.stringify(data) 
        });
    },

    updateStatus: (drugId: string, status: string) => {
        return apiClient(`/drug-profiles/${drugId}/status?status=${status}`, {
            method: "PATCH" 
        });
    }
};