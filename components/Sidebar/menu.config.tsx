
import { BellOutlined, HomeOutlined, LayoutOutlined, TeamOutlined } from "@ant-design/icons";
import type { UserRole } from "constants/type";

export type MenuItem = {
    key: string;
    label: string;
    icon?: React.ReactNode;
    path?: string;
    children?: MenuItem[];
};

export const menuByRole: Record<UserRole, MenuItem[]> = {
    MANUFACTURER: [
        {
            key: "dashboard",
            label: "Bảng điều khiển",
            icon: <LayoutOutlined />,
            path: "/manufacturer/dashboard",
        },
        {
            key: "warehouse",
            label: "Kho hàng",
            icon: <HomeOutlined />,
            children: [
                {
                    key: "profile",
                    label: "Hồ sơ thuốc",
                    path: "/manufacturer/warehouse/profile",
                    children: [
                        {
                            key: "create",
                            label: "Thêm thuốc",
                            path: "/manufacturer/warehouse/profile/create",
                        },
                    ],
                },
                {
                    key: "batch",
                    label: "Lô thuốc",
                    path: "/manufacturer/warehouse/batch",
                    children: [
                        {
                            key: "create",
                            label: "Thêm lô",
                            path: "/manufacturer/warehouse/batch/create",
                        },
                        {
                            key: "detail",
                            label: "Chi tiết lô",
                            path: "/manufacturer/warehouse/batch/:id",
                        },
                    ],
                },
            ],
        },
        {
            key: "facilities",
            label: "Cơ sở",
            icon: <HomeOutlined />,
            path: "/manufacturer/facilities",
        },
        {
            key: "staff",
            label: "Nhân viên",
            icon: <TeamOutlined />,
            children: [
                {
                    key: "profile",
                    label: "Danh sách nhân viên",
                    path: "/manufacturer/staff",
                },
                {
                    key: "create",
                    label: "Thêm nhân viên",
                    path: "/manufacturer/staff/create",
                },
                {
                    key: "register",
                    label: "Duyệt hồ sơ",
                    path: "/manufacturer/staff/register",
                },
            ],
        },
        {
            key: "alerts",
            label: "Cảnh báo",
            icon: <BellOutlined />,
            path: "/manufacturer/alerts",
        },
    ],

    DISTRIBUTOR: [
        {
            key: "dashboard",
            label: "Bảng điều khiển",
            icon: <LayoutOutlined />,
            path: "/distributor/dashboard",
        },
        {
            key: "warehouse",
            label: "Kho hàng",
            icon: <HomeOutlined />,
            path: "/distributor/warehouse",
        },
    ],

    ADMIN: [
        {
            key: "dashboard",
            label: "Dashboard",
            icon: <LayoutOutlined />,
            path: "/admin/dashboard",
        },
    ],
};