import { Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BatchData, BatchStatus } from "constants/MockBatchData";

const { Link } = Typography;

const statusMap: Record<
    BatchStatus,
    { label: string; color: string }
> = {
    production: { label: "Sản xuất", color: "gold" },
    shipping: { label: "Vận chuyển", color: "green" },
    recall: { label: "Thu hồi", color: "red" },
    completed: { label: "Hoàn tất", color: "blue" },
};

export const columns: ColumnsType<BatchData> = [
    {
        title: "Mã lô",
        dataIndex: "batchCode",
        key: "batchCode",
    },
    {
        title: "Tên thuốc",
        dataIndex: "medicineName",
        key: "medicineName",
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: BatchStatus) => {
            const config = statusMap[status];
            return <Tag color={config.color}>{config.label}</Tag>;
        },
    },
    {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
    },
    {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
            <Link onClick={() => console.log("View", record.key)}>
                Xem chi tiết »
            </Link>
        ),
    },
];