import { 
    BankOutlined, 
    FileTextOutlined, 
    SafetyCertificateOutlined, 
    TeamOutlined, 
    WarningOutlined 
} from "@ant-design/icons";
import { Button, Col, Flex, Row, Spin, message } from "antd";
import StatCard from "components/Card/StatCard";
import SummaryCard from "components/Card/SummaryCard";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";

import { organizationApi } from "api/organizationApi";
import { drugProfileApi } from "api/drugProfileApi";
import { drugBatchApi } from "api/drugBatchApi";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function RegulatorDashboard() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOrgs: 0,
        pendingOrgs: 0,
        
        totalDrugs: 0,
        pendingDrugs: 0,
        
        totalBatches: 0,
        pendingQC: 0,
        failedQC: 0,

        totalStaff: 0,
        pendingStaff: 0,
    });

    const isLoggedIn = !!user; 
    const currentOrgId = user?.orgId || "";

    const fetchDashboardData = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            setLoading(true);
            
            const [orgsRes, drugsRes, batchesRes, staffRes] = await Promise.all([
                organizationApi.getAll({ page: 0, size: 100 }),
                drugProfileApi.getAll({ page: 0, size: 100 }),
                drugBatchApi.getAll({ page: 0, size: 100 }),
                employeeApi.getAll({ orgId: currentOrgId, page: 0, size: 100 }) 
            ]);
            
            const allOrgs = orgsRes.data || orgsRes.content || [];
            const pendingOrgsCount = allOrgs.filter((o: any) => o.status === "PENDING").length;

            const allDrugs = drugsRes.data || drugsRes.content || [];
            const pendingDrugsCount = allDrugs.filter((d: any) => d.status === "PENDING").length;

            const allBatches = batchesRes.data || batchesRes.content || [];
            const pendingQCCount = allBatches.filter((b: any) => b.qcStatus === "PENDING").length;
            const failedQCCount = allBatches.filter((b: any) => b.qcStatus === "FAILED").length;

            const allStaff = staffRes.data || staffRes.content || [];
            const activeStaffCount = allStaff.filter((s: any) => s.enabled === true).length;
            const pendingStaffCount = allStaff.filter((s: any) => s.enabled === false).length;

            setStats({
                totalOrgs: orgsRes.totalElements || orgsRes.total || allOrgs.length,
                pendingOrgs: pendingOrgsCount,
                
                totalDrugs: drugsRes.totalElements || drugsRes.total || allDrugs.length,
                pendingDrugs: pendingDrugsCount,
                
                totalBatches: batchesRes.totalElements || batchesRes.total || allBatches.length,
                pendingQC: pendingQCCount,
                failedQC: failedQCCount,

                totalStaff: activeStaffCount,
                pendingStaff: pendingStaffCount
            });

        } catch (error) {
            console.error("Lỗi tải Dashboard:", error);
            message.error("Không thể tải dữ liệu thống kê tổng quan!");
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn, currentOrgId]); 

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        <div style={{ padding: 8 }}>
            <Spin spinning={loading} tip="Đang đồng bộ dữ liệu Blockchain..." size="large">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Link to="/regulator/warehouse/batch" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<SafetyCertificateOutlined />}
                                value={stats.pendingQC}
                                label="Lô thuốc chờ kiểm định"
                                footerText="Tiến hành kiểm định ngay"
                                color="blue"
                            />
                        </Link>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Link to="/regulator/company/register" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<BankOutlined />}
                                value={stats.pendingOrgs}
                                label="Công ty chờ duyệt"
                                footerText="Xem danh sách đăng ký"
                                color="blue"
                            />
                        </Link>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Link to="/regulator/warehouse/profile" style={{ display: 'block' }}>
                            <SummaryCard
                                icon={<FileTextOutlined />}
                                value={stats.pendingDrugs}
                                label="Hồ sơ thuốc chờ duyệt"
                                footerText="Xem danh sách hồ sơ"
                                color="blue"
                            />
                        </Link>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Link to="/regulator/staff/register" style={{ display: 'block' }}>
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
                            <Link to="/regulator/manufacturer">
                                <StatCard
                                    title="Mạng lưới Tổ chức tham gia"
                                    items={[
                                        { value: stats.totalOrgs, label: "Tổng số Tổ chức/Công ty" },
                                        { 
                                            value: stats.pendingOrgs, 
                                            label: "Hồ sơ đăng ký mới (Chờ duyệt)" 
                                        },
                                    ]}
                                />
                            </Link>
                            
                            <Link to="/regulator/warehouse/profile">
                                <StatCard
                                    title="Quản lý Lưu hành Thuốc"
                                    items={[
                                        { value: stats.totalDrugs.toLocaleString(), label: "Tổng số Hồ sơ Thuốc" },
                                        { value: stats.pendingDrugs.toLocaleString(), label: "Hồ sơ đang chờ cấp phép" },
                                    ]}
                                />
                            </Link>
                        </Flex>
                    </Col>

                    <Col xs={24} md={12}>
                        <Flex vertical gap={16} style={{ height: "100%" }}>
                            <Link to="/regulator/warehouse/batch">
                                <StatCard
                                    title="Giám sát Chuỗi cung ứng"
                                    items={[
                                        { value: stats.totalBatches.toLocaleString(), label: "Tổng số Lô thuốc lưu thông" },
                                        { value: stats.pendingQC, label: "Lô thuốc đang chờ QC" },
                                    ]}
                                />
                            </Link>

                            <Link to="/regulator/staff">
                                <StatCard
                                    title="Nội bộ Cục Quản lý Dược"
                                    items={[
                                        { value: stats.totalStaff, label: "Cán bộ / Thanh tra viên" },
                                        { 
                                            value: stats.pendingStaff < 10 && stats.pendingStaff > 0 ? `0${stats.pendingStaff}` : stats.pendingStaff, 
                                            label: "Tài khoản nhân viên chờ duyệt" 
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