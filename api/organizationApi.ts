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
    
    createFacility: (orgId: string, data: any) => {
        return apiClient(`/organizations/${orgId}/facilities`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getFacilities: (orgId: string) => apiClient(`/organizations/${orgId}/facilities`, { method: "GET" }),
};