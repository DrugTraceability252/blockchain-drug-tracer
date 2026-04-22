import { Button, Layout, Flex, Tooltip } from "antd";
import styles from './Header.module.css';
import { LogoutOutlined, MenuOutlined } from "@ant-design/icons";
import { useKeycloak } from "@react-keycloak/web";

const { Header: AntdHeader } = Layout;
type Props = {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
};

export default function Header({ collapsed, setCollapsed }: Props) {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) return <div>Đang tải Keycloak...</div>;
    
    return (
        <AntdHeader className={styles.headerLayout}>
            <Flex justify="space-between" align="center" style={{ width: "100%", padding: "0 16px" }}>
                
                <Button
                    type="text"
                    icon={<MenuOutlined style={{ fontSize: '18px' }} />}
                    onClick={() => setCollapsed(!collapsed)}
                />

                <Flex align="center">
                    {!keycloak.authenticated ? (
                        <Button type="primary" onClick={() => keycloak.login()}>
                            Đăng nhập với Keycloak
                        </Button>
                    ) : (
                        <Tooltip title={`Đăng xuất (${keycloak.tokenParsed?.preferred_username})`} placement="bottomRight">
                            <Button 
                                type="text" 
                                danger 
                                icon={<LogoutOutlined style={{ fontSize: '20px' }} />} 
                                onClick={() => keycloak.logout()} 
                            />
                        </Tooltip>
                    )}
                </Flex>
                
            </Flex>
        </AntdHeader>
    );
}