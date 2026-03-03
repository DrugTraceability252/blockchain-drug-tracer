import { Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { EmployeeData, EmployeeStatus } from "constants/MockEmployeeData";

const { Link } = Typography;

const statusMap: Record<
    EmployeeStatus,
    { label: string; color: string }
> = {
    active: { label: "Đã kích hoạt", color: "green" },
    inactive: { label: "Hủy kích hoạt", color: "red" },
};

export const columns: ColumnsType<EmployeeData> = [
    {
        title: "Mã nhân viên",
        dataIndex: "employeeCode",
        key: "employeeCode",
    },
    {
        title: "Họ và tên",
        dataIndex: "fullName",
        key: "fullName",
    },
    {
        title: "Vị trí",
        dataIndex: "position",
        key: "position",
    },
    {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: EmployeeStatus) => {
            const config = statusMap[status];
            return <Tag color={config.color}>{config.label}</Tag>;
        },
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