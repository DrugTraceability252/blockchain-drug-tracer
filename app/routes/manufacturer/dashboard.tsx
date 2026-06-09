import { SafetyCertificateOutlined, FileTextOutlined, TeamOutlined } from "@ant-design/icons";
import { Col, Flex, Row, message, Spin } from "antd";
import StatCard from "components/Card/StatCard";
import SummaryCard from "components/Card/SummaryCard";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";

import { drugProfileApi } from "api/drugProfileApi";
import { facilityApi } from "api/facilityApi";
import { employeeApi } from "api/employeeApi";
import { drugBatchApi } from "api/drugBatchApi";
import { useAuth } from "auth/useAuth";

export default function ManufacturerDashboard() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDrugs: 0,
        pendingDrugs: 0,
        totalFacilities: 0,
        activeStaff: 0,
        pendingStaff: 0,
        totalBatches: 0,
        pendingQC: 0,
        totalBoxes: 0,
        shipping: 0,
        waiting: 0,
    });

    const fetchDashboardData = useCallback(async () => {
        if (!user?.orgId) return;

        try {
            setLoading(true);
            
            const [drugsRes, facilitiesRes, staffRes, batchesRes] = await Promise.all([
                drugProfileApi.getAll({ manufacturerOrgId: user.orgId, page: 0, size: 1000 }), 
                facilityApi.getByOrgId(user.orgId, { page: 0, size: 100 }),
                employeeApi.getAll({ orgId: user.orgId, page: 0, size: 1000 }),
                drugBatchApi.getAll({ orgId: user.orgId, page: 0, size: 2000 }) 
            ]);

            const allDrugs = drugsRes.data || drugsRes.content || [];
            const pendingDrugsCount = allDrugs.filter((d: any) => d.approveStatus === "PENDING").length;

            const allStaff = staffRes.data || staffRes.content || [];
            const activeStaffCount = allStaff.filter((s: any) => s.enabled === true).length;
            const pendingStaffCount = allStaff.filter((s: any) => s.enabled === false).length;

            const allBatches = batchesRes.data || batchesRes.content || batchesRes || [];
            const pendingQCCount = allBatches.filter((b: any) => b.qcStatus === "PENDING").length;
            const totalBoxesCount = allBatches.reduce((sum: number, batch: any) => sum + (batch.totalBoxes || 0), 0);
            const shippingCount = allBatches.filter((b: any) => b.status === "IN_TRANSIT").length;
            const waitingCount = allBatches.filter((b: any) => b.qcStatus === "PENDING" || b.status === "PRODUCED").length;

            setStats({
                totalDrugs: drugsRes.totalElements || drugsRes.total || allDrugs.length,
                pendingDrugs: pendingDrugsCount,
                totalFacilities: facilitiesRes.totalElements || facilitiesRes.total || facilitiesRes.data?.length || 0,
                activeStaff: activeStaffCount,
                pendingStaff: pendingStaffCount,
                totalBatches: batchesRes.totalElements || batchesRes.total || allBatches.length,
                pendingQC: pendingQCCount,
                totalBoxes: totalBoxesCount,
                shipping: shippingCount,
                waiting: waitingCount
            });

        } catch (error) {
            console.error(error);
            message.error("Không thể tải dữ liệu thống kê!");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div style={{ padding: 8 }}>
            <Spin spinning={loading} tip="Đang tổng hợp dữ liệu..." size="large">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <Link to="/manufacturer/warehouse/batch" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<SafetyCertificateOutlined />}
                                value={stats.pendingQC}
                                label="Lô thuốc chờ kiểm định"
                                footerText="Đang chờ Cục Quản lý duyệt"
                                color="blue"
                            />
                        </Link>
                    </Col>
                    
                    <Col xs={24} md={8}>
                        <Link to="/manufacturer/warehouse/profile" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<FileTextOutlined />}
                                value={stats.pendingDrugs}
                                label="Hồ sơ chờ cấp phép"
                                footerText="Hồ sơ đang chờ duyệt"
                                color="blue"
                            />
                        </Link>
                    </Col>

                    <Col xs={24} md={8}>
                        <Link to="/manufacturer/staff" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<TeamOutlined />}
                                value={stats.pendingStaff}
                                label="Nhân viên chờ duyệt"
                                footerText="Duyệt tài khoản mới"
                                color="blue"
                            />
                        </Link>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16}}>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <Link to="/manufacturer/facilities">
                                <StatCard
                                    title="Quản lý Cơ sở"
                                    items={[
                                        { value: stats.totalFacilities, label: "Tổng số cơ sở trực thuộc" },
                                        { value: "03", label: "Đạt chuẩn GSP/GMP" }, 
                                    ]}
                                />
                            </Link>
                            <Link to="/manufacturer/warehouse/batch">
                                <StatCard
                                    title="Quản lý số lượng sản xuất"
                                    items={[
                                        { value: stats.totalBoxes.toLocaleString(), label: "Hộp thuốc đã đóng gói" },
                                        { value: stats.totalBatches.toLocaleString(), label: "Lô thuốc đã sản xuất" },
                                    ]}
                                />
                            </Link>
                        </Flex>
                    </Col>
                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <StatCard
                                title="Vận chuyển (Logistics)"
                                items={[
                                    { value: stats.shipping, label: "Lô thuốc đang vận chuyển" },
                                    { value: stats.waiting < 10 && stats.waiting > 0 ? `0${stats.waiting}` : stats.waiting, label: "Lô thuốc đang lưu kho / chờ QC" },
                                ]}
                            />
                            
                            <Link to="/manufacturer/staff">
                                <StatCard
                                    title="Quản trị nhân sự"
                                    items={[
                                        { value: stats.activeStaff, label: "Nhân viên đang hoạt động" },
                                        { 
                                            value: stats.pendingStaff < 10 && stats.pendingStaff > 0 ? `0${stats.pendingStaff}` : stats.pendingStaff, 
                                            label: "Tài khoản chờ duyệt" 
                                        },
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