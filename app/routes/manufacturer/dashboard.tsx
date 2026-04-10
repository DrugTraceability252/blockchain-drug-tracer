import { DownloadOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Row, message, Spin } from "antd";
import StatCard from "components/Card/StatCard";
import SummaryCard from "components/Card/SummaryCard";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";

import { drugProfileApi } from "api/drugProfileApi";
import { facilityApi } from "api/facilityApi";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function ManufacturerDashboard() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    // 🌟 Quản lý State chứa các con số thống kê
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDrugs: 0,
        totalFacilities: 0,
        activeStaff: 0,
        pendingStaff: 0,
        
        // Mấy cái này bạn chưa có API nên tạm để mock data
        warnings: 1,
        totalBatches: 5288,
        totalBoxes: 70856,
        shipping: 20,
        waiting: 5,
    });

    // 🌟 Hàm gom tất cả API lại và gọi cùng 1 lúc cho lẹ
    const fetchDashboardData = useCallback(async () => {
        if (!user?.orgId) return;

        try {
            setLoading(true);
            
            // Dùng Promise.all để 3 API chạy song song cùng lúc
            const [drugsRes, facilitiesRes, staffRes] = await Promise.all([
                // Lấy Thuốc: Chỉ cần size: 1 vì ta chỉ quan tâm biến 'total'
                drugProfileApi.getAll({ manufacturerOrgId: user.orgId, page: 1, size: 1 }),
                
                // Lấy Cơ sở: Cũng chỉ cần size: 1
                facilityApi.getByOrgId(user.orgId, { page: 1, size: 1 }),
                
                // Lấy Nhân sự: Lấy nhiều một chút để lọc tại Frontend
                employeeApi.getAll({ orgId: user.orgId, page: 1, size: 100 })
            ]);

            // Bóc tách dữ liệu nhân sự (Lọc theo trạng thái enabled)
            const allStaff = staffRes.data || [];
            const activeStaffCount = allStaff.filter((s: any) => s.enabled === true).length;
            const pendingStaffCount = allStaff.filter((s: any) => s.enabled === false).length;

            // Cập nhật lên màn hình
            setStats(prev => ({
                ...prev,
                totalDrugs: drugsRes.total || 0,
                totalFacilities: facilitiesRes.total || facilitiesRes.data?.length || 0,
                activeStaff: activeStaffCount,
                pendingStaff: pendingStaffCount
            }));

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

    // Action Header
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
            <Spin spinning={loading} tip="Đang tổng hợp dữ liệu..." size="large">
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        {/* Bọc Link để bấm vào Card nhảy sang trang tương ứng luôn */}
                        <Link to="/manufacturer/drug-profiles" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<PlusOutlined/>}
                                value={stats.totalDrugs}
                                label="Hồ sơ thuốc"
                                footerText="Xem danh sách chi tiết"
                                color="blue"
                            />
                        </Link>
                    </Col>
                    <Col xs={24} md={12}>
                        <SummaryCard
                            icon={<WarningOutlined/>}
                            value={`0${stats.warnings}`}
                            label="Cảnh báo hệ thống"
                            footerText="Xem báo cáo chi tiết"
                            color="red"
                        />
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
                                        { value: "03", label: "Đạt chuẩn GSP/GMP" }, // Chờ BE có API thì map vô
                                    ]}
                                />
                            </Link>
                            <Link to="/manufacturer/warehouse/batch">
                                <StatCard
                                    title="Quản lý lô thuốc"
                                    items={[
                                        { value: stats.totalBoxes.toLocaleString(), label: "Hộp thuốc" },
                                        { value: stats.totalBatches.toLocaleString(), label: "Lô thuốc" },
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
                                    { value: `0${stats.waiting}`, label: "Lô thuốc đang chờ" },
                                ]}
                            />
                            
                            <Link to="/manufacturer/staff">
                                <StatCard
                                    title="Quản trị nhân sự"
                                    items={[
                                        { value: stats.activeStaff, label: "Nhân viên đang hoạt động" },
                                        { 
                                            value: stats.pendingStaff < 10 ? `0${stats.pendingStaff}` : stats.pendingStaff, 
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