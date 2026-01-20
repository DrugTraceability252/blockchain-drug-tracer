import { Outlet } from "react-router";
import { ConfigProvider, Layout } from "antd";
import Sidebar from "components/Sidebar/Sidebar";
import { useAuth } from "auth/useAuth";
import { antdTheme } from "theme/antd-theme";
import { colors } from "theme/colors";
import Header from "components/Header/Header";
import Breadcrumb from "components/Breadcrumb/Breadcrumb";

const { Content } = Layout;

export default function MainLayout() {
    const { user } = useAuth();
    return (
        <ConfigProvider theme={antdTheme}>
            <Layout style={{ minHeight: "100vh" }}>
                <Sidebar role={user.role} userName={user.name} />

                <Layout style={{ backgroundColor: colors.bgPrimary }}>
                    <Header />
                    
                    <Content style={{ padding: "24px" }}>
                        <Breadcrumb role={user.role} />
                        <Outlet />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
