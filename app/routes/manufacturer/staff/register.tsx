import { Row, Col, Card, Button, Divider, Flex, message, Spin, Empty } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { InfoRow } from "components/InfoRow/InfoRow";
import { useEffect, useState, useCallback } from "react";
import { authApi, employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function RegisterList() {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // 🌟 1. Hàm tải danh sách tài khoản cần duyệt
    const fetchPendingUsers = useCallback(async () => {
        if (!user?.orgId) return;

        try {
            setLoading(true);
            const response = await employeeApi.getAll({
                orgId: user.orgId,
                page: 1,
                size: 100, // Lấy nhiều một chút để lọc
            });

            const allUsers = response.data || [];
            
            // LỌC: Chỉ lấy những user đang bị khóa (chờ duyệt)
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

    // 🌟 2. Hàm xử lý khi bấm nút "Chấp nhận"
    const handleApprove = async (userId: string) => {
        try {
            setActionLoading(userId); // Bật loading cho đúng cái nút đang bấm
            await authApi.approve(userId);
            
            message.success("Duyệt tài khoản thành công!");
            
            // Xóa user đó khỏi danh sách hiển thị
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi duyệt tài khoản!");
        } finally {
            setActionLoading(null);
        }
    };

    // 🌟 3. Xử lý thuật toán bóc tách dữ liệu
    const parseUserData = (record: any) => {
        const fullName = `${record.lastName || ''} ${record.firstName || ''}`.trim() || record.username;
        const groupString = record.attributes?.group?.[0] || "";
        const parts = groupString.split('/');
        
        return {
            name: fullName,
            role: parts[3] === "ADMIN" ? "Quản lý" : "Nhân viên kho bãi",
            department: parts[2] || "Chưa cập nhật", // Facility ID
            cccd: record.attributes?.identityNumber?.[0] || "Chưa cập nhật",
            // Các trường Backend chưa hỗ trợ trong DTO, có thể hiển thị tạm
            dob: "Chưa cập nhật", 
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
                            <Col span={12} key={item.id} style={{padding: 8}}>
                                <Card style={{ padding: 12 }}>
                                    <InfoRow label="Họ và tên" value={info.name} />
                                    <InfoRow label="Chức vụ" value={info.role} />
                                    <InfoRow label="Cơ sở (Phòng ban)" value={info.department} />
                                    <InfoRow label="Ngày sinh" value={info.dob} />
                                    <InfoRow label="Số CCCD" value={info.cccd} />

                                    <div
                                        style={{
                                            marginTop: 16,
                                            border: "1px dashed #d9d9d9",
                                            borderRadius: 8,
                                            padding: "8px 12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 8,
                                            color: "#1677ff",
                                            backgroundColor: "#f0f5ff",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <PaperClipOutlined />
                                        hoso_minhchung.pdf
                                    </div>

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