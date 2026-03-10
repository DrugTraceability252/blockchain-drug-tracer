import { Outlet, useNavigate } from "react-router";
import { Button, ConfigProvider, Flex, Layout } from "antd";
import Sidebar from "components/Sidebar/Sidebar";
import { useAuth } from "auth/useAuth";
import { antdTheme } from "theme/antd-theme";
import { colors } from "theme/colors";
import Header from "components/Header/Header";
import Breadcrumb from "components/Breadcrumb/Breadcrumb";
import "components/Header/Header.shared.css";
import { useMemo, useState, type ReactNode } from "react";
import { HeaderActionContext } from "contexts/HeaderActionsContext";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Content, Header: AntdHeader } = Layout;

export default function MainLayout() {
    const { user } = useAuth();
    const [headerActions, setHeaderActions] = useState<ReactNode>(null);
    const contextValue = useMemo(
        () => ({ setHeaderActions }),
        [setHeaderActions]
    );
    const navigate = useNavigate();
    return (
        <ConfigProvider theme={antdTheme}>
            <HeaderActionContext.Provider value={contextValue}>
                <Layout style={{ minHeight: "100vh" }}>
                    <Sidebar role={user.role} userName={user.name} />

                    <Layout style={{ backgroundColor: colors.bgPrimary }}>
                        <Header />
                        
                        <Content className="contentLayout" style={{ padding: "24px" }}>
                            <AntdHeader className="headerLayout">
                                <Flex justify="space-between" align="center">
                                    <Flex align="center" gap={12}>
                                        <Button
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() => navigate(-1)}
                                        />
                                        <Breadcrumb role={user.role} />
                                    </Flex>
                                    <Flex>
                                        {headerActions}
                                    </Flex>
                                </Flex>
                                
                            </AntdHeader>
                            <Content className="contentLayoutLowLevel">
                                <Outlet />
                            </Content>
                        </Content>
                    </Layout>
                </Layout>
            </HeaderActionContext.Provider>
        </ConfigProvider>
    );
}
