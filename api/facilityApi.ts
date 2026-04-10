import { apiClient } from "./apiClient";

export const facilityApi = {
    getByOrgId: (orgId: string, params: { page: number; size: number }) => {
        const queryString = new URLSearchParams(params as any).toString();
        return apiClient(`/organizations/${orgId}/facilities?${queryString}`, { 
            method: "GET" 
        });
    },

    create: (orgId: string, data: any) => {
        return apiClient(`/organizations/${orgId}/facilities`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
};