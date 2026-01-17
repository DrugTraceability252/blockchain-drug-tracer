import { Outlet } from "react-router";
import { ConfigProvider, Layout } from "antd";
import Sidebar from "components/Sidebar/Sidebar";
import { useAuth } from "auth/useAuth";
import { antdTheme } from "theme/antd-theme";

const { Sider, Content } = Layout;

export default function MainLayout() {
    const { user } = useAuth();
    return (
        <ConfigProvider theme={antdTheme}>
            <Layout style={{ minHeight: "100vh" }}>
                <Sidebar role={user.role} userName={user.name} />

                <Layout>
                    <Content>
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
