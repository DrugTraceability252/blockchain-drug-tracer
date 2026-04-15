import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Modal, Descriptions, Table, Tag, Space, Popconfirm, Typography, message, Flex } from "antd";
import { useEffect, useState, useCallback } from "react";
import { authApi, employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

const { Title, Text } = Typography;

export default function RegulatorStaffApprove() {
    const { user } = useAuth();
    
    const isLoggedIn = !!user;
    const currentOrgId = user?.orgId || "";

    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchPendingUsers = useCallback(async () => {
        if (!isLoggedIn) return;

        try {
            setLoading(true);
            const response = await employeeApi.getAll({
                orgId: currentOrgId,
                page: 0,
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
    }, [isLoggedIn, currentOrgId]);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

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

    const showDetailModal = (record: any) => {
        setSelectedUser(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleApprove = async (userId: string) => {
        try {
            setActionLoading(userId); 
            await authApi.approve(userId);
            message.success("Duyệt tài khoản thành công!");
            setPendingUsers(prev => prev.filter(u => u.id !== userId));
            closeModal();
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi duyệt tài khoản!");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId: string) => {
        message.info("Đã từ chối cấp quyền cho tài khoản!");
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        closeModal();
    };

    const columns = [
        {
            title: 'Họ và tên',
            key: 'name',
            render: (_: any, record: any) => {
                const info = parseUserData(record);
                return (
                    <div>
                        <div style={{ fontWeight: 500 }}>{info.name}</div>
                        <div style={{ fontSize: '12px', color: 'gray' }}>@{record.username}</div>
                    </div>
                );
            }
        },
        {
            title: 'Liên hệ',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò / Chức vụ',
            key: 'role',
            render: (_: any, record: any) => {
                const info = parseUserData(record);
                return (
                    <Space direction="vertical" size={0}>
                        <Tag color={info.role === "Quản trị viên" ? "purple" : "blue"}>{info.role}</Tag>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{info.department}</Text>
                    </Space>
                );
            }
        },
        {
            title: 'Số CCCD',
            key: 'cccd',
            render: (_: any, record: any) => parseUserData(record).cccd
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        style={{ color: '#1677ff' }}
                        onClick={() => showDetailModal(record)}
                    >
                    </Button>

                    <Popconfirm
                        title="Duyệt tài khoản?"
                        onConfirm={() => handleApprove(record.id)}
                        okText="Duyệt"
                        cancelText="Hủy"
                    >
                        <Button 
                            type="text" 
                            style={{ color: '#52c41a' }} 
                            icon={<CheckOutlined />}
                            loading={actionLoading === record.id}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Table 
                columns={columns} 
                dataSource={pendingUsers} 
                loading={loading}
                rowKey="id"
                locale={{ emptyText: "Không có tài khoản nào đang chờ duyệt" }}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Hồ sơ tài khoản cán bộ</Title>}
                open={isModalOpen}
                onCancel={closeModal}
                width={700}
                centered
                footer={[
                    <Button key="back" onClick={closeModal}>
                        Đóng
                    </Button>,
                    <Popconfirm
                        key="reject"
                        title="Từ chối tài khoản này?"
                        onConfirm={() => handleReject(selectedUser?.id)}
                        okText="Từ chối"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<CloseOutlined />}>Từ chối</Button>
                    </Popconfirm>,
                    <Button 
                        key="approve" 
                        type="primary" 
                        style={{ backgroundColor: '#52c41a' }} 
                        icon={<CheckOutlined />}
                        loading={actionLoading === selectedUser?.id}
                        onClick={() => handleApprove(selectedUser?.id)}
                    >
                        Cấp quyền truy cập
                    </Button>,
                ]}
            >
                {selectedUser && (() => {
                    const info = parseUserData(selectedUser);
                    return (
                        <div style={{ marginTop: 24 }}>
                            <Descriptions 
                                bordered 
                                column={1} 
                                size="small" 
                                labelStyle={{ fontWeight: 600, width: '160px', backgroundColor: '#f9f9f9' }}
                            >
                                <Descriptions.Item label="Họ và tên">
                                    <Text strong style={{ fontSize: 15 }}>{info.name}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên đăng nhập (ID)">
                                    <Tag>{selectedUser.username}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color="orange">Chờ cấp quyền</Tag>
                                </Descriptions.Item>

                                <Descriptions.Item label="Chức vụ">
                                    <Tag color={info.role === "Quản trị viên" ? "purple" : "blue"}>{info.role}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phòng ban / Đơn vị">{info.department}</Descriptions.Item>
                                
                                <Descriptions.Item label="Email liên hệ">{selectedUser.email}</Descriptions.Item>
                                <Descriptions.Item label="Số CMND / CCCD">{info.cccd}</Descriptions.Item>
                            </Descriptions>

                            <Flex align="center" style={{ marginTop: 16, padding: '12px 16px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                                <Text type="warning" style={{ fontSize: 13 }}>
                                    ⚠️ <b>Lưu ý:</b> Cán bộ này sẽ được cấp quyền truy cập hệ thống ngay lập tức sau khi bạn phê duyệt. Vui lòng xác minh kỹ danh tính trước khi xác nhận.
                                </Text>
                            </Flex>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}