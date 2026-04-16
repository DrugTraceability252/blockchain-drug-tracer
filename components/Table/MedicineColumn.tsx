import { Space, Tooltip, Button, Tag } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Link as RouterLink } from "react-router";
import type { Medicine } from "constants/type";

const statusMap: Record<string, { color: string; label: string }> = {
    PENDING: { color: "orange", label: "Chờ duyệt" },
    APPROVED: { color: "green", label: "Đã duyệt" },
    REJECTED: { color: "red", label: "Từ chối" }
};

const drugTypeMap: Record<string, string> = {
    OTC: "Không kê đơn (OTC)",
    PRESCRIPTION: "Thuốc kê đơn"
};

export const getColumns = (onEditClick: (record: Medicine) => void): ColumnsType<Medicine> => [
  {
    title: "Tên thuốc",
    dataIndex: "drugName",
    key: "name",
    sorter: (a, b) => a.drugName.localeCompare(b.drugName),
  },
  {
    title: "Số Đăng Ký",
    dataIndex: "licenseNumber",
    key: "licenseNumber",
  },
  {
    title: "Loại thuốc",
    dataIndex: "drugType",
    key: "drugType",
    render: (type: string) => drugTypeMap[type] || type
  },
  {
    title: "Dạng bào chế",
    dataIndex: "dosageForm",
    key: "dosageForm",
  },
  {
    title: "Hoạt chất chính",
    dataIndex: "ingredient",
    key: "ingredient",
  },
  {
    title: "Hàm lượng",
    dataIndex: "strength",
    key: "strength",
  },
  {
    title: "Trạng thái",
    dataIndex: "approveStatus",
    key: "approveStatus",
    render: (status: string) => {
        const config = statusMap[status] || { color: "default", label: status || "Không rõ" };
        return <Tag color={config.color} style={{ padding: '2px 10px', borderRadius: '4px' }}>{config.label}</Tag>;
    }
  },
  {
    title: "Hành động",
    key: "action",
    align: "center",
    render: (_, record) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Space size="middle">
            <Tooltip title="Xem chi tiết">
                <RouterLink to={record.drugId} state={record}>
                  <Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }} />
                </RouterLink>
            </Tooltip>

            <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => console.log("Xóa", record.drugId)} />
            </Tooltip>
        </Space>
    </div>
    ),
  },
];