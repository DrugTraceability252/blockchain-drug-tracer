// constants/MockBatchData.ts

export type BatchStatus = "production" | "shipping" | "recall" | "completed";

export interface BatchData {
    key: string;
    batchCode: string;
    medicineName: string;
    status: BatchStatus;
    quantity: number;
}

export const BatchData: BatchData[] = [
    {
        key: "1",
        batchCode: "L06ID232435454",
        medicineName: "Augmentin 625 Duo Tablet",
        status: "production",
        quantity: 350,
    },
    {
        key: "2",
        batchCode: "L06ID232435451",
        medicineName: "Azithral 500 Tablet",
        status: "shipping",
        quantity: 20,
    },
    {
        key: "3",
        batchCode: "L06ID232435452",
        medicineName: "Ascoril LS Syrup",
        status: "recall",
        quantity: 85,
    },
    {
        key: "4",
        batchCode: "L06ID232435450",
        medicineName: "Azee 500 Tablet",
        status: "completed",
        quantity: 75,
    },
    {
        key: "5",
        batchCode: "L06ID232435455",
        medicineName: "Allegra 120mg Tablet",
        status: "shipping",
        quantity: 44,
    },
    {
        key: "6",
        batchCode: "L06ID232435456",
        medicineName: "Alex Syrup",
        status: "shipping",
        quantity: 65,
    },
    {
        key: "7",
        batchCode: "L06ID232435457",
        medicineName: "Amoxyclav 625 Tablet",
        status: "completed",
        quantity: 150,
    },
    {
        key: "8",
        batchCode: "L06ID232435458",
        medicineName: "Avil 25 Tablet",
        status: "completed",
        quantity: 270,
    },
];