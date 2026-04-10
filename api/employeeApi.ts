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
            body: JSON.stringify(userData),
        });
    },
    approve: (userId: string) => {
        return apiClient(`/auth/approve/${userId}`, {
            method: "PATCH",
        });
    }
};