
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
                },
                {
                    key: "batch",
                    label: "Lô thuốc",
                    path: "/manufacturer/warehouse/batch",
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
            path: "/manufacturer/staff",
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