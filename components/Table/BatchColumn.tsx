import { Space, Typography, Tag, Popover, Button, Image } from "antd";
import { QrcodeOutlined, EyeOutlined } from "@ant-design/icons"; // 🌟 ĐÃ THÊM EyeOutlined
import dayjs from "dayjs";

const { Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const batchStatusMap: Record<string, { color: string; label: string }> = {
    PRODUCED: { color: "gold", label: "Đã sản xuất" },
    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
    STORED: { color: "cyan", label: "Lưu kho" },
    DISTRIBUTED: { color: "green", label: "Đã phân phối" },
    RECALLED: { color: "volcano", label: "Thu hồi" },
};

export const columns = (onView?: (record: any) => void) => [
    {
        title: "Mã lô & QR",
        dataIndex: "batchId",
        key: "batchId",
        render: (text: string) => (
            <Space>
                <Image
                    width={64}
                    height={64}
                    src={`${API_BASE_URL}/files/preview?objectName=qrcode/${text}/batch.jpg`}
                    fallback="https://via.placeholder.com/64?text=No+QR"
                    style={{ borderRadius: 6, border: '1px solid #f0f0f0' }}
                />
            </Space>
        )
    },
    {
        title: "Sản phẩm",
        dataIndex: "drugId",
        key: "drugId",
        render: (text: string, record: any) => (
            <Popover content={`ID gốc: ${text}`} title="Chi tiết mã">
                <Text strong>{record.drugName}</Text>
            </Popover>
        )
    },
    {
        title: "Cơ sở sản xuất",
        dataIndex: "manufacturerFacilityId",
        key: "manufacturerFacilityId",
        render: (text: string, record: any) => (
            <Popover content={`Mã cơ sở: ${text}`}>
                <Text type="secondary">{record.facilityName || `CS_${text.substring(0, 6)}`}</Text>
            </Popover>
        )
    },
    {
        title: "Sản lượng",
        dataIndex: "totalBoxes",
        key: "totalBoxes",
        render: (total: number, record: any) => (
            <Text>{total} {record.unit || 'hộp'}</Text>
        )
    },
    {
        title: "Hạn sử dụng",
        dataIndex: "expiryDate",
        key: "expiryDate",
        render: (date: string) => date ? dayjs(date).format("DD/MM/YYYY") : "—"
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
            const config = batchStatusMap[status] || { color: "default", label: status };
            return <Tag color={config.color}>{config.label}</Tag>;
        }
    },
    {
        title: "Hành động",
        key: "action",
        align: "center",
        render: (_: any, record: any) => (
            <Button
                type="text"
                icon={<EyeOutlined style={{ fontSize: '18px', color: '#1677ff' }} />}
                onClick={() => onView && onView(record)}
                title="Xem chi tiết"
            />
        )
    }
];