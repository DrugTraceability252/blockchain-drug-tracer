import { Layout, Menu, Avatar, Flex } from "antd";
import { useLocation, useNavigate } from "react-router";
import { menuByRole } from "./menu.config";
import { Typography } from "antd";
import { Image } from 'antd';
import styles from './Sidebar.module.css';
import { colors } from "theme/colors";
import { useState } from "react";
import type { UserRole } from "constants/type";

const { Sider } = Layout;
const { Title, Text } = Typography;

type Props = {
    role: UserRole;
    userName: string;
};

export default function Sidebar({ role, userName }: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const items = menuByRole[role].map((item) => ({
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: item.children?.map((c) => ({
        key: c.key,
        label: c.label,
        onClick: () => navigate(c.path!),
        })),
        onClick: item.path ? () => navigate(item.path!) : undefined,
    }));

    return (
        <Sider
            width={240}
            collapsedWidth={68}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            className={styles.sidebar}
        >
            {/* Logo */}
            <Flex
                align="center"
                justify={collapsed ? "center" : "flex-start"}
                gap={12}
                className={styles.sidebarHeader}
            >
                <Image src="/main-logo.png" width={40} preview={false} />
                {!collapsed && (
                <Title level={3} style={{ color: colors.bgBase, margin: 0 }}>
                    PharmacyTrace
                </Title>
                )}
            </Flex>

            {/* User */}
            <Flex
                align="center"
                justify={collapsed ? "center" : "flex-start"}
                gap={12}
                className={styles.sidebarUser}
            >
                <Avatar />
                {!collapsed && (
                <Flex vertical>
                    <Text style={{ color: "white" }}>{userName}</Text>
                    <Text style={{ fontSize: 12, color: colors.green }}>
                    Manager
                    </Text>
                </Flex>
                )}
            </Flex>


            {/* Menu */}
            <Menu
                mode="inline"
                theme="dark"
                selectedKeys={[location.pathname]}
                items={items}
            />
        </Sider>
    );
}
