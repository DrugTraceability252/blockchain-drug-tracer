import { Row, Col, Card, Button, Divider, Flex, message, Spin, Empty } from "antd";
import { InfoRow } from "components/InfoRow/InfoRow";
import { useEffect, useState, useCallback } from "react";
import { authApi, employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function RegulatorStaffApprove() {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPendingUsers = useCallback(async () => {
        if (!user?.orgId) return;

        try {
            setLoading(true);
            const response = await employeeApi.getAll({
                orgId: user.orgId,
                page: 1,
                size: 100, 
            });

            const allUsers = response.data || response.content || [];
            const waitlist = allUsers.filter((u: any) => u.enabled === false);
            setPendingUsers(waitlist);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách chờ duyệt!");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId]);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    const handleApprove = async (userId: string) => {
        try {
            setActionLoading(userId); 
            await authApi.approve(userId);
            message.success("Duyệt tài khoản thành công!");
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi duyệt tài khoản!");
        } finally {
            setActionLoading(null);
        }
    };

    const parseUserData = (record: any) => {
        const fullName = `${record.lastName || ''} ${record.firstName || ''}`.trim() || record.username;
        const groupString = record.attributes?.group?.[0] || "";
        const parts = groupString.split('/');
        
        return {
            name: fullName,
            role: parts[3] === "ADMIN" ? "Quản trị viên" : "Cán bộ kiểm duyệt",
            department: parts[2] || "Phòng nghiệp vụ", 
            cccd: record.attributes?.identityNumber?.[0] || "Chưa cập nhật",
        };
    };

    return (
        <div style={{ padding: 24 }}>
            {loading ? (
                <Flex justify="center" align="center" style={{ minHeight: '50vh' }}>
                    <Spin tip="Đang tải danh sách chờ duyệt..." size="large" />
                </Flex>
            ) : pendingUsers.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12 }}>
                    <Empty description="Không có tài khoản nào đang chờ duyệt" />
                </Card>
            ) : (
                <Row gutter={[24, 24]}>
                    {pendingUsers.map((item) => {
                        const info = parseUserData(item);
                        return (
                            <Col span={12} key={item.id}>
                                <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 8}}>
                                    <InfoRow label="Họ và tên" value={info.name as any} />
                                    <InfoRow label="Chức vụ" value={info.role} />
                                    <InfoRow label="Phòng ban" value={info.department} />
                                    <InfoRow label="Email" value={item.email} />
                                    <InfoRow label="Số CCCD" value={info.cccd} />

                                    <Divider style={{ margin: '16px 0px' }} />

                                    <Flex justify="space-between" align="center">
                                        <Button danger>Từ chối</Button>
                                        <Button 
                                            type="primary" 
                                            loading={actionLoading === item.id}
                                            onClick={() => handleApprove(item.id)}
                                        >
                                            Chấp nhận
                                        </Button>
                                    </Flex>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
}