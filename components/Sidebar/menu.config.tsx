
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
                    key: "drugProfile",
                    label: "Hồ sơ thuốc",
                    path: "/manufacturer/warehouse/profile",
                    children: [
                        {
                            key: "create",
                            label: "Thêm thuốc",
                            path: "/manufacturer/warehouse/profile/create",
                        },
                        {
                            key: "detail",
                            label: "Chi tiết hồ sơ thuốc",
                            path: "/manufacturer/warehouse/profile/:id",
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
                            children: [
                                {   key: "detail",
                                    label: "Chi tiết hộp thuốc",
                                    path: "/manufacturer/warehouse/batch/:id/:boxid",
                                },
                            ]
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
                    key: "staffProfile",
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
            key: "distribute",
            label: "Vận chuyển",
            icon: <HomeOutlined />,
            children: [
                {
                    key: "create",
                    label: "Danh sách vận chuyển",
                    path: "/distributor/distribute",
                    children: [
                        {
                            key: "detail",
                            label: "Chi tiết vận chuyển",
                            path: "/distributor/distribute/:id",
                        },
                    ]
                },
                
            ]
        },
        {
            key: "staff",
            label: "Nhân viên",
            icon: <TeamOutlined />,
            children: [
                {
                    key: "dStaffProfile",
                    label: "Danh sách nhân viên",
                    path: "/distributor/staff",
                },
                {
                    key: "create",
                    label: "Thêm nhân viên",
                    path: "/distributor/staff/create",
                },
                {
                    key: "register",
                    label: "Duyệt hồ sơ",
                    path: "/distributor/staff/register",
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

    REGULATOR: [
        {
            key: "dashboard",
            label: "Bảng điều khiển",
            icon: <LayoutOutlined />,
            path: "/regulator/dashboard",
        },
        {
            key: "create",
            label: "Đăng ký tổ chức",
            icon: <LayoutOutlined />,
            children: [
                {
                    key: "createcompany",
                    label: "Tạo công ty",
                    path: "/regulator/company/create"
                },
                {
                    key: "createfacility",
                    label: "Tạo cơ sở",
                    path: "/regulator/facility/create"
                },
                {
                    key: "registercompany",
                    label: "Duyệt công ty",
                    path: "/regulator/company/register"
                },
            ]
        },
        {
            key: "manufacturerOrg",
            label: "Quản lý công ty",
            icon: <LayoutOutlined />,
            children: [
                {
                    key: "manufacturer",
                    label: "Nhà sản xuất",
                    path: "/regulator/manufacturer",
                    children: [
                        {
                            key: "detail",
                            label: "Chi tiết công ty",
                            path: "/regulator/company/:id",
                        },
                    ]
                },
                {
                    key: "distributor",
                    label: "Nhà phân phối",
                    path: "/regulator/distributor",
                    children: [
                        {
                            key: "detail",
                            label: "Chi tiết công ty",
                            path: "/regulator/company/:id",
                        },
                    ]
                },
                {
                    key: "pharmacy",
                    label: "Nhà thuốc",
                    path: "/regulator/pharmacy",
                    children: [
                        {
                            key: "detail",
                            label: "Chi tiết công ty",
                            path: "/regulator/company/:id",
                        },
                    ]
                },
            ]
        },
        {
            key: "inventory",
            label: "Quản lý hàng hóa",
            icon: <LayoutOutlined />,
            children: [
                {
                    key: "regulatorProfile",
                    label: "Hồ sơ thuốc",
                    path: "/regulator/warehouse/profile",
                    children: [
                        {
                            key: "create",
                            label: "Thêm hồ sơ thuốc",
                            path: "/regulator/warehouse/profile/create",
                        },
                        {
                            key: "detail",
                            label: "chi tiết thuốc",
                            path: "/regulator/warehouse/profile/:id",
                        },
                    ]
                },
                {
                    key: "batch",
                    label: "Lô thuốc",
                    path: "/regulator/warehouse/batch",
                    children: [
                        {
                            key: "detail",
                            label: "Chi tiết lô",
                            path: "/regulator/warehouse/batch/:id",
                        },
                        {
                            key: "register",
                            label: "Duyệt lô",
                            path: "/regulator/warehouse/batch/:id/register",
                        }
                    ],
                },
            ]
        },
        {
            key: "staff",
            label: "Quản lý tài khoản",
            icon: <LayoutOutlined />,
            children: [
                {
                    key: "profile",
                    label: "Danh sách tài khoản",
                    path: "/regulator/staff",
                },
                {
                    key: "createstaff",
                    label: "Thêm tài khoản",
                    path: "/regulator/staff/create",
                },
                {
                    key: "register",
                    label: "Duyệt hồ sơ",
                    path: "/regulator/staff/register",
                },
            ]
        },
    ],

    PHARMACY: [
        {
            key: "dashboard",
            label: "Bảng điều khiển",
            icon: <LayoutOutlined />,
            path: "/pharmacy/dashboard",
        },
        {
            key: "distribute",
            label: "Vận chuyển",
            icon: <HomeOutlined />,
            children: [
                {
                    key: "create",
                    label: "Danh sách vận chuyển",
                    path: "/pharmacy/distribute",
                    children: [
                        {
                            key: "detail",
                            label: "Chi tiết vận chuyển",
                            path: "/pharmacy/distribute/:id",
                        },
                    ]
                },
                
            ]
        },
        {
            key: "staff",
            label: "Nhân viên",
            icon: <TeamOutlined />,
            children: [
                {
                    key: "pStaffProfile",
                    label: "Danh sách nhân viên",
                    path: "/pharmacy/staff",
                },
                {
                    key: "create",
                    label: "Thêm nhân viên",
                    path: "/pharmacy/staff/create",
                },
                {
                    key: "register",
                    label: "Duyệt hồ sơ",
                    path: "/pharmacy/staff/register",
                },
            ],
        },
        {
            key: "alerts",
            label: "Cảnh báo",
            icon: <BellOutlined />,
            path: "/pharmacy/alerts",
        },
    ],
};