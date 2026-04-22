import { Layout, Menu, Avatar, Flex, Typography, Image } from "antd";
import { useLocation, useNavigate } from "react-router";
import { menuByRole } from "./menu.config";
import styles from './Sidebar.module.css';
import { colors } from "theme/colors";
import { useState } from "react";
import type { UserRole } from "constants/type";

const { Sider } = Layout;
const { Title, Text } = Typography;

type Props = {
    role: UserRole;
    userName: string;
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    isMobile: boolean; 
};

export default function Sidebar({ role, userName, collapsed, setCollapsed, isMobile }: Props) {
    const navigate = useNavigate();
    const location = useLocation();

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

    const [openKeys, setOpenKeys] = useState(
        menuByRole[role]
            .filter(item => item.children)
            .map(item => item.key)
    );

    return (
        <Sider
            width={240}
            breakpoint="md"
            collapsedWidth={isMobile ? 0 : 68}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            trigger={null}
            className={styles.sidebar}
            style={
                isMobile 
                    ? { position: 'absolute', zIndex: 999, height: '100vh', left: 0 } 
                    : { height: '100vh' }
            }
        >
            <Flex align="center" justify={collapsed ? "center" : "flex-start"} gap={12} style={{ padding: collapsed ? '16px 0' : '16px' }}>
                <Image src="/main-logo.png" width={40} preview={false} />
                {!collapsed && (
                    <Title level={3} style={{ color: colors.bgBase, margin: 0 }}>PharmacyTrace</Title>
                )}
            </Flex>

            <Flex align="center" justify={collapsed ? "center" : "flex-start"} gap={12} style={{ padding: collapsed ? '16px 0' : '16px' }}>
                <Avatar />
                {!collapsed && (
                    <Flex vertical>
                        <Text style={{ color: "white" }}>{userName}</Text>
                        <Text style={{ fontSize: 12, color: colors.green }}>{role}</Text>
                    </Flex>
                )}
            </Flex>

            <Menu mode="inline" theme="dark" selectedKeys={[location.pathname]} openKeys={openKeys} onOpenChange={setOpenKeys} items={items} />
        </Sider>
    );
}