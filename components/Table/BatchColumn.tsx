import { Space, Typography, Tag, Popover, QRCode, Button } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

const batchStatusMap: Record<string, { color: string; label: string }> = {
    PRODUCED: { color: "gold", label: "Đã sản xuất" },
    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
    STORED: { color: "cyan", label: "Lưu kho" },
    DISTRIBUTED: { color: "green", label: "Đã phân phối" },
    RECALLED: { color: "volcano", label: "Thu hồi" },
};

export const columns = () => [
    {
        title: "Mã lô & QR",
        dataIndex: "batchId",
        key: "batchId",
        render: (text: string) => (
            <Space>
                <Text strong style={{ color: '#1677ff' }}>{text}</Text>
                <Popover 
                    content={<QRCode value={text} size={140} bordered={false} />} 
                    title="QR Truy xuất Lô"
                    trigger="hover"
                >
                    <QrcodeOutlined style={{ fontSize: '18px', color: '#1677ff', cursor: 'pointer' }} />
                </Popover>
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
        // 🌟 Tương tự, rút gọn ID vô nghĩa của Facility
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
    }
];