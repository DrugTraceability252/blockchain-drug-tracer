import { Outlet } from "react-router";
import { ConfigProvider, Layout } from "antd";
import Sidebar from "components/Sidebar/Sidebar";
import { useAuth } from "auth/useAuth";
import { antdTheme } from "theme/antd-theme";
import { colors } from "theme/colors";
import Header from "components/Header/Header";
import Breadcrumb from "components/Breadcrumb/Breadcrumb";
import "components/Header/Header.shared.css";

const { Content, Header: AntdHeader } = Layout;

export default function MainLayout() {
    const { user } = useAuth();
    return (
        <ConfigProvider theme={antdTheme}>
            <Layout style={{ minHeight: "100vh" }}>
                <Sidebar role={user.role} userName={user.name} />

                <Layout style={{ backgroundColor: colors.bgPrimary }}>
                    <Header />
                    
                    <Content className="contentLayout" style={{ padding: "24px" }}>
                        <AntdHeader className="headerLayout">
                            <Breadcrumb role={user.role} />
                        </AntdHeader>
                        <Content className="contentLayoutLowLevel">
                            <Outlet />
                        </Content>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
