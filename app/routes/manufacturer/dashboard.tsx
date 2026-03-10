import { DownloadOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Row } from "antd";
import StatCard from "components/Card/StatCard";
import SummaryCard from "components/Card/SummaryCard";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";
import { Link } from "react-router";

export default function ManufacturerDashboard() {
    const { setHeaderActions } = useHeaderActions();

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/manufacturer/warehouse/batch/create">
                    <Button variant='outlined' icon={<DownloadOutlined />} iconPlacement="end" size="large">
                        Tải xuống báo cáo
                    </Button>
                </Link>
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions]);
    return (
        <div style={{ padding: 8 }}>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <SummaryCard
                        icon={<PlusOutlined/>}
                        value={298}
                        label="Hồ sơ thuốc"
                        footerText="Xem thông tin chi tiết"
                        color="blue"
                    />
                </Col>
                <Col xs={24} md={12}>
                    <SummaryCard
                        icon={<WarningOutlined/>}
                        value="01"
                        label="Cảnh báo"
                        footerText="Xem báo cáo chi tiết"
                        color="red"
                    />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16}}>
                <Col xs={24} md={12}>
                    <Flex vertical gap={16} style={{ height: "100%" }}>
                        <StatCard
                            title="Cơ sở"
                            items={[
                                { value: 298, label: "Tổng số thuốc" },
                                { value: 24, label: "Nhóm thuốc" },
                            ]}
                        />
                        <StatCard
                            title="Quản lý lô thuốc"
                            items={[
                                { value: "70,856", label: "Hộp thuốc" },
                                { value: "5,288", label: "Lô thuốc" },
                            ]}
                        />
                    </Flex>
                </Col>
                <Col xs={24} md={12}>
                    <Flex vertical gap={16} style={{ height: "100%" }}>
                        <StatCard
                            title="Vận chuyển"
                            items={[
                                { value: 20, label: "Lô thuốc đang vận chuyển" },
                                { value: "05", label: "Lô thuốc đang chờ" },
                            ]}
                        />

                        <StatCard
                            title="Nhân viên"
                            items={[
                                { value: 100, label: "Nhân viên" },
                                { value: "01", label: "Tài khoản chờ duyệt" },
                            ]}
                        />
                    </Flex>
                </Col>
            </Row>
        </div>
    );
}