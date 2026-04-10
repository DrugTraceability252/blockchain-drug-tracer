import { Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link as RouterLink } from "react-router";

const { Link } = Typography;

export type BatchData = {
    batchId: string;
    drugId: string;
    drugName?: string;
    manufacturerFacilityId: string;
    manufacturerOrgId: string;
    productionDate: string;
    expiryDate: string;
    totalBoxes: number;
    unit: string;
    status: string;
};

const statusMap: Record<string, { label: string; color: string }> = {
    PRODUCED: { label: "Đã sản xuất", color: "gold" },
    IN_TRANSIT: { label: "Đang vận chuyển", color: "blue" },
    DELIVERED: { label: "Đã giao hàng", color: "green" },
    RECALLED: { label: "Thu hồi", color: "red" },
};

export const columns: ColumnsType<BatchData> = [
    {
        title: "Mã lô",
        dataIndex: "batchId",
        key: "batchId",
    },
    {
        title: "Mã thuốc", 
        dataIndex: "drugId", 
        key: "drugId",
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
            const config = statusMap[status] || { label: status || "UNKNOWN", color: "default" };
            return <Tag color={config.color}>{config.label}</Tag>;
        },
    },
    {
        title: "Số lượng",
        dataIndex: "totalBoxes", 
        key: "totalBoxes",
        render: (text, record) => `${text} ${record.unit || ''}`,
    },
    {
        title: "Ngày sản xuất",
        dataIndex: "productionDate",
        key: "productionDate",
        render: (dateStr) => {
            if (!dateStr) return "";
            return new Date(dateStr).toLocaleDateString("vi-VN");
        }
    },
    {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
            <RouterLink 
                to={`/manufacturer/warehouse/batch/${record.batchId}`}
                style={{ color: '#1890ff' }}
            >
                Xem chi tiết
            </RouterLink>
        ),
    },
];