import keycloak from "utils/keycloak";
import { apiClient } from "./apiClient";

export const drugBatchApi = {
    getAll: (params: { 
        page: number; 
        size: number; 
        orgId?: string; 
        facilityId?: string;
        qcStatus?: string;
        status?: string;
        currentFacilityId?: string;
    }) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null && v !== "")
        ) as Record<string, string>;

        const queryString = new URLSearchParams(cleanParams).toString();
        return apiClient(`/drug-batches?${queryString}`, { method: "GET" });
    },

    getById: (batchId: string) => {
        return apiClient(`/drug-batches/${batchId}`, { method: "GET" });
    },

    create: (payload: any) => {
        return apiClient('/drug-batches', { 
            method: 'POST',
            body: payload 
        });
    },

    getBoxByBatchId: (params: { 
        page: number; 
        size: number; 
        batchId: string;
    }) => {
        const queryString = new URLSearchParams({
            batchId: params.batchId,
            page: params.page.toString(),
            size: params.size.toString()
        }).toString();
        
        return apiClient(`/drug-boxes?${queryString}`, { method: "GET" });
    },

    transfer: (payload: { batchId: string; toOrgId: string; toFacilityId: string; note?: string }) => {
        return apiClient(`/transports/ship-batch`, { 
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    receive: (eventId: string) => {
        return apiClient(`/transports/${eventId}/receive`, { 
            method: "POST" 
        });
    },

    updateQCStatus: (batchId: string, qcStatus: string) => {
        return apiClient(
            `/drug-batches/${batchId}/qc-status?qcStatus=${qcStatus}`,
            { method: "PATCH" }
        );
    },
    
    getHistory: (batchId: string) => {
        return apiClient(`/drug-batches/${batchId}/history`, { method: "GET" });
    },

    getTransportHistory: (batchId: string) => {
        return apiClient(`/transports/batch/${batchId}/history`, { method: 'GET' });
    },

    getDocuments: (batchId: string) => {
        return apiClient(`/drug-batches/${batchId}/documents`, { method: "GET" });
    },

    getPreviewDocument: async (batchId: string, filename: string) => {
        const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const response = await fetch(`${BASE_URL}/drug-batches/${batchId}/documents/${filename}/preview`, {
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
    getBoxHistory: (boxId: string, batchId: string) => {
        return apiClient(`/drug-boxes/${boxId}/history?batchId=${batchId}`, { method: 'GET' });
    },

    updateBoxStatus: (boxId: string, status: string) => {
        return apiClient(`/drug-boxes/${boxId}/status?status=${status}`, { method: 'PATCH' });
    }
};