import { DownloadOutlined, CarOutlined, WarningOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Row, Spin, message } from "antd";
import StatCard from "components/Card/StatCard";
import SummaryCard from "components/Card/SummaryCard";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";

import { drugBatchApi } from "api/drugBatchApi";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function LogisticsDashboard() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        deliveringBatches: 0,
        deliveredBatches: 0,
        totalStaff: 0,
        pendingStaff: 0,
        warnings: 0
    });

    const fetchDashboardData = useCallback(async () => {
        if (!user?.orgId) return;

        try {
            setLoading(true);
            const [batchesRes, staffRes] = await Promise.all([
                drugBatchApi.getAll({ orgId: user.orgId, page: 1, size: 100 }),
                employeeApi.getAll({ orgId: user.orgId, page: 1, size: 100 })
            ]);

            const allBatches = batchesRes.data || batchesRes.content || [];
            
            const delivering = allBatches.filter((b: any) => b.status === "IN_TRANSIT").length;
            
            const delivered = allBatches.filter((b: any) => b.status === "STORED" || b.status === "DISTRIBUTED").length;

            const allStaff = staffRes.data || staffRes.content || [];
            const activeStaffCount = allStaff.filter((s: any) => s.enabled === true).length;
            const pendingStaffCount = allStaff.filter((s: any) => s.enabled === false).length;

            setStats({
                deliveringBatches: delivering,
                deliveredBatches: delivered,
                totalStaff: activeStaffCount,
                pendingStaff: pendingStaffCount,
                warnings: 0
            });

        } catch (error) {
            console.error("Lỗi tải Dashboard vận chuyển:", error);
            message.error("Không thể tải dữ liệu thống kê!");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Button variant='outlined' icon={<DownloadOutlined />} size="large">
                    Xuất báo cáo giao nhận
                </Button>
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    return (
        <div style={{ padding: 8 }}>
            <Spin spinning={loading} tip="Đang tải dữ liệu chuyến xe..." size="large">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        {/* 🌟 Trỏ về trang Danh sách vận đơn của Logistics */}
                        <Link to="/logistics/batch" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<CarOutlined />} // Đổi Icon xe tải
                                value={stats.deliveringBatches} 
                                label="Chuyến hàng đang giao"
                                footerText="Xem lịch trình xe chạy"
                                color="blue"
                            />
                        </Link>
                    </Col>
                    <Col xs={24} md={12}>
                        <SummaryCard
                            icon={<WarningOutlined/>}
                            value={`0${stats.warnings}`}
                            label="Sự cố trên đường"
                            footerText="Mất kết nối / Sai nhiệt độ khoang lạnh"
                            color="red"
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16}}>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <Link to="/logistics/batch">
                                <StatCard
                                    title="Tiến độ Vận chuyển"
                                    items={[
                                        { value: stats.deliveringBatches, label: "Đang di chuyển (In-Transit)" },
                                        { value: stats.deliveredBatches, label: "Đã bàn giao thành công" },
                                    ]}
                                />
                            </Link>
                        </Flex>
                    </Col>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <Link to="/logistics/staff">
                                <StatCard
                                    title="Quản trị Tài xế & Điều phối"
                                    items={[
                                        { value: stats.totalStaff, label: "Tài xế / Điều phối viên" },
                                        { value: stats.pendingStaff < 10 ? `0${stats.pendingStaff}` : stats.pendingStaff, label: "Tài khoản chờ cấp phép" },
                                    ]}
                                />
                            </Link>
                        </Flex>
                    </Col>
                </Row>
            </Spin>
        </div>
    );
}