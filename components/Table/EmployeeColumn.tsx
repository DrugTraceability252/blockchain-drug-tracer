import { Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { EmployeeData } from "constants/MockEmployeeData"; 

const { Link } = Typography;

export const columns: ColumnsType<EmployeeData> = [
    {
        title: "Họ và tên",
        key: "fullName",
        render: (_, record) => {
            const fullName = `${record.lastName || ''} ${record.firstName || ''}`.trim();
            return <b>{fullName || record.username}</b>;
        },
    },
    {
        title: "Tài khoản",
        dataIndex: "username",
        key: "username",
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
    },
    {
        title: "CCCD / CMND",
        key: "identityNumber",
        render: (_, record) => {
            // Lấy phần tử đầu tiên trong mảng identityNumber
            const idNum = record.attributes?.identityNumber?.[0];
            return idNum ? idNum : <span style={{ color: '#ccc' }}>Chưa cập nhật</span>;
        },
    },
    {
        title: "Số điện thoại",
        key: "phone",
        render: (_, record) => {
            const phone = record.attributes?.phone?.[0];
            return phone ? phone : <span style={{ color: '#ccc' }}>Chưa cập nhật</span>;
        },
    },
    {
        title: "Vai trò",
        key: "role",
        render: (_, record) => {
            const groupString = record.attributes?.group?.[0];
            
            if (!groupString) return <Tag color="default">Chưa phân quyền</Tag>;

            // Cắt chuỗi phân quyền (VD: "MANUFACTURER/ORG001/FAC001/ADMIN")
            const parts = groupString.split('/');
            const subRole = parts[parts.length - 1]; // Luôn lấy phần tử cuối cùng

            switch (subRole) {
                case 'ADMIN':
                    return <Tag color="red">Quản trị viên</Tag>;
                case 'STAFF':
                    return <Tag color="blue">Nhân viên</Tag>;
                case 'MANAGER':
                    return <Tag color="orange">Quản lý</Tag>;
                default:
                    return <Tag color="cyan">{subRole}</Tag>;
            }
        },
    },
    {
        title: "Trạng thái",
        key: "status",
        render: (_, record) => {
            // Keycloak trả về boolean 'enabled' thay vì string status
            return record.enabled ? (
                <Tag color="green">Đang hoạt động</Tag>
            ) : (
                <Tag color="red">Đã khóa</Tag>
            );
        },
    },
    {
        title: "Hành động",
        key: "action",
        render: (_, record) => (
            <Link onClick={() => console.log("View", record.id)}>
                Xem chi tiết »
            </Link>
        ),
    },
];