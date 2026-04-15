import { Button, Layout, Flex, Tooltip } from "antd";
import styles from './Header.module.css';
import { LogoutOutlined } from "@ant-design/icons";
import { useKeycloak } from "@react-keycloak/web";

const { Header: AntdHeader } = Layout;

export default function Header() {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) return <div>Đang tải Keycloak...</div>;
    
    return (
        <AntdHeader className={styles.headerLayout}>
            <Flex justify="flex-end" align="center" style={{ width: "100%", height: "100%" }}>
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
        </AntdHeader>
    );
}