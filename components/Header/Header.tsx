import { Button, Input, Layout } from "antd";
import styles from './Header.module.css';
import { SearchOutlined } from "@ant-design/icons";
import { useKeycloak } from "@react-keycloak/web";

const { Header: AntdHeader } = Layout;

export default function Header() {
    const { keycloak, initialized } = useKeycloak();

    if (!initialized) return <div>Đang tải Keycloak...</div>;
    return (
        <AntdHeader className={styles.headerLayout}>
            <div>
                {!keycloak.authenticated ? (
                    <Button type="primary" onClick={() => keycloak.login()}>
                        Đăng nhập với Keycloak
                    </Button>
                ) : (
                    <Button danger onClick={() => keycloak.logout()}>
                        Đăng xuất ({keycloak.tokenParsed?.preferred_username})
                    </Button>
                )}
            </div>
        </AntdHeader>
    );
}