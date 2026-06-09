import { Table, Button, Flex, message, Space, Typography, Modal, Popconfirm, Descriptions, Tag } from "antd";
import { PaperClipOutlined, CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback, useMemo } from "react";
import { authApi, employeeApi } from "api/employeeApi";
import { organizationApi } from "api/organizationApi";
import { useAuth } from "auth/useAuth";
import { formatPhoneNumber } from "utils/phoneformat";

const { Text, Title } = Typography;

export default function RegisterList() {
    const { user } = useAuth();
    const [pendingUsers, setPendingUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [facilitiesMap, setFacilitiesMap] = useState<Record<string, string>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const fetchPendingUsers = useCallback(async () => {
        if (!user?.orgId) return;
        try {
            setLoading(true);
            const response = await employeeApi.getAll({
                orgId: user.orgId,
                page: 1,
                size: 100, 
            });
            const allUsers = response.data || [];
            const waitlist = allUsers.filter((u: any) => u.enabled === false);
            setPendingUsers(waitlist);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách chờ duyệt!");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId]);

    const fetchFacilities = useCallback(async () => {
        if (!user?.orgId) return;
        try {
            const res = await organizationApi.getFacilities(user.orgId);
            const data = res.data || res || [];
            
            const map: Record<string, string> = {};
            data.forEach((fac: any) => {
                map[fac.facilityId] = fac.facilityName;
            });
            setFacilitiesMap(map);
        } catch (error) {
            console.error("Lỗi lấy danh sách cơ sở:", error);
        }
    }, [user?.orgId]);

    useEffect(() => {
        fetchPendingUsers();
        fetchFacilities();
    }, [fetchPendingUsers, fetchFacilities]);

    const parseUserData = useCallback((record: any) => {
        const fullName = `${record.lastName || ''} ${record.firstName || ''}`.trim() || record.username;
        const groupString = record.attributes?.group?.[0] || "";
        const parts = groupString.split('/');
        
        const facilityId = parts[2];

        return {
            name: fullName,
            role: parts[3] === "ADMIN" ? "Quản trị viên" : "Nhân viên kho bãi",
            department: facilitiesMap[facilityId] || facilityId || "Chưa cập nhật",
            cccd: record.attributes?.identityNumber?.[0] || "Chưa cập nhật",
            dob: "Chưa cập nhật", 
        };
    }, [facilitiesMap]);

    const openModal = (record: any) => {
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
        message.success("Đã từ chối tài khoản!");
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        closeModal();
    };

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: "name",
            key: "name",
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: "Chức vụ",
            dataIndex: "role",
            key: "role",
            render: (text: string) => <Tag color={text === "Quản trị viên" ? "purple" : "blue"}>{text}</Tag>
        },
        {
            title: "CCCD / CMND",
            key: "identityNumber",
            render: (record: any) => {
                const idNum = record.attributes?.identityNumber?.[0];
                return idNum ? idNum : <span style={{ color: '#ccc' }}>Chưa cập nhật</span>;
            },
        },
        {
            title: "Số điện thoại",
            key: "phone",
            render: (record: any) => {
                const phone = record.attributes?.phone?.[0];
                return phone ? formatPhoneNumber(phone) : <span style={{ color: '#ccc' }}>Chưa cập nhật</span>;
            },
        },
        {
            title: "Cơ sở (Phòng ban)",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Hồ sơ đính kèm",
            key: "attachment",
            render: () => (
                <Text type="secondary" style={{ cursor: 'pointer' }}>
                    <PaperClipOutlined /> Minh chứng
                </Text>
            )
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
                        onClick={() => openModal(record)}
                        title="Xem chi tiết"
                    />
                    
                    {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                        <>
                            <Popconfirm
                                title="Xác nhận duyệt"
                                description="Bạn có chắc chắn muốn duyệt tài khoản này?"
                                onConfirm={() => handleApprove(record.id)}
                                okText="Đồng ý"
                                cancelText="Hủy"
                            >
                                <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<CheckOutlined />} 
                                    loading={actionLoading === record.id}
                                >
                                    Duyệt
                                </Button>
                            </Popconfirm>

                            <Popconfirm
                                title="Từ chối tài khoản"
                                description="Bạn có chắc chắn muốn từ chối?"
                                onConfirm={() => handleReject(record.id)}
                                okText="Đồng ý"
                                cancelText="Hủy"
                            >
                                <Button danger size="small" icon={<CloseOutlined />}>
                                    Từ chối
                                </Button>
                            </Popconfirm>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const tableData = useMemo(() => {
        return pendingUsers.map(user => ({
            ...user,
            ...parseUserData(user)
        }));
    }, [pendingUsers, parseUserData]);

    return (
        <Flex vertical>
            <div style={{ borderRadius: 8 }}>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    bordered
                    scroll={{ y: 'calc(100vh - 250px)' }}
                    locale={{ emptyText: "Không có tài khoản nào đang chờ duyệt" }}
                />
            </div>

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
                ]}
            >
                {selectedUser && (() => {
                    const info = parseUserData(selectedUser);
                    return (
                        <div>
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
                        </div>
                    );
                })()}
            </Modal>
        </Flex>
    );
}