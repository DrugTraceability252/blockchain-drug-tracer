import { apiClient } from "./apiClient";

export const drugBatchApi = {
    getAll: (params: { 
        page: number; 
        size: number; 
        orgId?: string; 
        facilityId?: string;
        qcStatus?: string;
        status?: string;
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

    create: (data: any) => {
        return apiClient(`/drug-batches`, { 
            method: "POST", 
            body: JSON.stringify(data) 
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
};