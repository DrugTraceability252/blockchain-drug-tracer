import { Layout, Menu, Avatar, Flex } from "antd";
import { useLocation, useNavigate } from "react-router";
import { menuByRole } from "./menu.config";
import type { UserRole } from "./types";
import { Typography } from "antd";
import { Image } from 'antd';
import styles from './Sidebar.module.css';

const { Sider } = Layout;
const { Title, Text } = Typography;

type Props = {
    role: UserRole;
    userName: string;
};

export default function Sidebar({ role, userName }: Props) {
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

    return (
        <Sider width={240} theme="dark" >
            {/* Logo */}
            <Flex justify="space-between" align="center" className={styles.sidebarHeader}>
                <Image src="/main-logo.png" alt="logo" width={48} height={48} preview={false} />
                <Title level={3} style={{ color: 'white', margin: 0 }}>PharmacyTrace</Title>
            </Flex>

            {/* User */}
            <Flex
                align="center"
                gap={12}
                style={{
                    padding: "12px 16px",
                    color: "white",
                }}
            >
                <Avatar />

                <Flex vertical>
                    <Text style={{ color: "white" }}>{userName}</Text>
                    <Text style={{ fontSize: 12, color: "#01A768" }}>
                        Manager
                    </Text>
                </Flex>
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
