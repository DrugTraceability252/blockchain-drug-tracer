import type { UserRole } from "./types";
import { BellOutlined, HomeOutlined, LayoutOutlined, TeamOutlined } from "@ant-design/icons";

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
                    key: "inventory",
                    label: "Tồn kho",
                    path: "/manufacturer/warehouse/inventory",
                },
            ],
        },
        {
            key: "facility",
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
            key: "alert",
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