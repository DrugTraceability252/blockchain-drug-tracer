import { DownloadOutlined, InboxOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Row, Spin, message } from "antd";
import StatCard from "components/Card/StatCard";
import SummaryCard from "components/Card/SummaryCard";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";

import { drugBatchApi } from "api/drugBatchApi";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function DistributorDashboard() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        storedBatches: 0,
        inTransitBatches: 0,
        totalStaff: 0,
        pendingStaff: 0,
        warnings: 0
    });

    const fetchDashboardData = useCallback(async () => {
        if (!user?.orgId) return;

        try {
            setLoading(true);
            const [batchesRes, staffRes] = await Promise.all([
                // Lấy các lô thuốc thuộc về tổ chức này
                drugBatchApi.getAll({ orgId: user.orgId, page: 1, size: 100 }),
                employeeApi.getAll({ orgId: user.orgId, page: 1, size: 100 })
            ]);

            // Bóc tách Lô thuốc
            const allBatches = batchesRes.data || batchesRes.content || [];
            // Lô đang lưu trong kho của nhà phân phối
            const stored = allBatches.filter((b: any) => b.status === "STORED" || b.status === "DISTRIBUTED").length;
            // Lô đang vận chuyển (đang giao đến nhà phân phối, hoặc nhà PP đang giao đi)
            const inTransit = allBatches.filter((b: any) => b.status === "IN_TRANSIT").length;

            // Bóc tách Nhân sự
            const allStaff = staffRes.data || staffRes.content || [];
            const activeStaffCount = allStaff.filter((s: any) => s.enabled === true).length;
            const pendingStaffCount = allStaff.filter((s: any) => s.enabled === false).length;

            setStats({
                storedBatches: stored,
                inTransitBatches: inTransit,
                totalStaff: activeStaffCount,
                pendingStaff: pendingStaffCount,
                warnings: 0 // Tạm mock 0 cảnh báo
            });

        } catch (error) {
            console.error("Lỗi tải Dashboard:", error);
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
                    Tải xuống báo cáo
                </Button>
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    return (
        <div style={{ padding: 8 }}>
            <Spin spinning={loading} tip="Đang tổng hợp dữ liệu..." size="large">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Link to="/distributor/warehouse/batch" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<InboxOutlined/>}
                                value={stats.storedBatches}
                                label="Lô hàng trong kho"
                                footerText="Xem danh sách lô hàng"
                                color="blue"
                            />
                        </Link>
                    </Col>
                    <Col xs={24} md={12}>
                        <SummaryCard
                            icon={<WarningOutlined/>}
                            value={`0${stats.warnings}`}
                            label="Cảnh báo vận chuyển"
                            footerText="Không có cảnh báo mới"
                            color="red"
                        />
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16}}>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <Link to="/distributor/warehouse/batch">
                                <StatCard
                                    title="Tình trạng Vận chuyển"
                                    items={[
                                        { value: stats.inTransitBatches, label: "Lô thuốc đang trên đường" },
                                        { value: stats.storedBatches, label: "Lô thuốc đã nhập kho an toàn" },
                                    ]}
                                />
                            </Link>
                        </Flex>
                    </Col>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <Link to="/distributor/staff">
                                <StatCard
                                    title="Quản trị Nhân viên"
                                    items={[
                                        { value: stats.totalStaff, label: "Nhân viên giao nhận / kho" },
                                        { value: stats.pendingStaff < 10 ? `0${stats.pendingStaff}` : stats.pendingStaff, label: "Tài khoản chờ duyệt" },
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