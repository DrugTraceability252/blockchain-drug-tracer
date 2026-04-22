import { Table, Pagination, Flex, Button, Modal, Descriptions, Tag, Typography } from "antd";
import { useState } from "react";
import { EyeOutlined } from "@ant-design/icons";
import { formatPhoneNumber } from "utils/phoneformat";
import type { ColumnsType } from "antd/es/table";

const { Text, Title } = Typography;

interface EmployeeTableProps {
    dataSource: any[];
    loading: boolean;
    pagination: any;
    onChange: (page: number, pageSize: number) => void;
}

export const getColumns = (openModal: (record: any) => void): ColumnsType<any> => [
    {
        title: "Họ và tên",
        key: "fullName",
        render: (_, record) => {
            const fullName = `${record.lastName || ''} ${record.firstName || ''}`.trim();
            return <b>{fullName || record.username}</b>;
        },
    },
    {
        title: "Email",
        dataIndex: "email",
        key: "email",
    },
    {
        title: "CCCD / CMND",
        key: "identityNumber",
        render: (_, record) => {
            const idNum = record.attributes?.identityNumber?.[0];
            return idNum ? idNum : <span style={{ color: '#ccc' }}>Chưa cập nhật</span>;
        },
    },
    {
        title: "Số điện thoại",
        key: "phone",
        render: (_, record) => {
            const phone = record.attributes?.phone?.[0];
            return phone ? formatPhoneNumber(phone) : <span style={{ color: '#ccc' }}>Chưa cập nhật</span>;
        },
    },
    {
        title: "Vai trò",
        key: "role",
        render: (_, record) => {
            const groupString = record.attributes?.group?.[0];
            if (!groupString) return <Tag color="default">Chưa phân quyền</Tag>;

            const parts = groupString.split('/');
            const subRole = parts[parts.length - 1];

            switch (subRole) {
                case 'ADMIN': return <Tag color="red">Quản trị viên</Tag>;
                case 'STAFF': return <Tag color="blue">Nhân viên</Tag>;
                case 'MANAGER': return <Tag color="orange">Quản lý</Tag>;
                default: return <Tag color="cyan">{subRole}</Tag>;
            }
        },
    },
    {
        title: "Trạng thái",
        key: "status",
        render: (_, record) => {
            return record.enabled ? (
                <Tag color="green">Đang hoạt động</Tag>
            ) : (
                <Tag color="red">Đã khóa</Tag>
            );
        },
    },
    {
        title: "Chi tiết",
        key: "action",
        align: 'center',
        render: (_, record) => (
            <Button 
                type="text" 
                icon={<EyeOutlined />} 
                style={{ color: '#1677ff' }}
                onClick={() => openModal(record)}
            />
        ),
    },
];

export default function EmployeeTable({ dataSource, loading, pagination, onChange }: EmployeeTableProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const openModal = (record: any) => {
        setSelectedUser(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const getRoleName = (groupString?: string) => {
        if (!groupString) return "Chưa cập nhật";
        const parts = groupString.split('/');
        const subRole = parts[parts.length - 1];
        if (subRole === 'ADMIN') return "Quản trị viên";
        if (subRole === 'STAFF') return "Nhân viên";
        if (subRole === 'MANAGER') return "Quản lý";
        return subRole;
    };

    const getDepartment = (groupString?: string) => {
        if (!groupString) return "Chưa cập nhật";
        const parts = groupString.split('/');
        return parts[2] || "Chưa cập nhật"; 
    };

    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={getColumns(openModal)}
                    dataSource={dataSource}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    bordered
                    scroll={{ y: "calc(100vh - 280px)" }}
                />
            </div>

            <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={pagination.current || 1}
                    pageSize={pagination.pageSize || 10}
                    total={pagination.total || 0}
                    onChange={(page, pageSize) => onChange(page, pageSize)} // 🌟 Nối thẳng lên hàm onChange của component cha
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Hồ sơ cán bộ nhân viên</Title>}
                open={isModalOpen}
                onCancel={closeModal}
                width={700}
                centered
                footer={[
                    <Button key="back" onClick={closeModal} type="primary">
                        Đóng
                    </Button>
                ]}
            >
                {selectedUser && (() => {
                    const fullName = `${selectedUser.lastName || ''} ${selectedUser.firstName || ''}`.trim() || selectedUser.username;
                    const groupStr = selectedUser.attributes?.group?.[0];
                    const idNum = selectedUser.attributes?.identityNumber?.[0] || "Chưa cập nhật";
                    const phone = selectedUser.attributes?.phone?.[0] || "Chưa cập nhật";

                    return (
                        <div style={{ marginTop: 24 }}>
                            <Descriptions 
                                bordered 
                                column={1} 
                                size="small" 
                                labelStyle={{ fontWeight: 600, width: '160px', backgroundColor: '#f9f9f9' }}
                            >
                                <Descriptions.Item label="Họ và tên">
                                    <Text strong style={{ fontSize: 15 }}>{fullName}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {selectedUser.enabled ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Đã khóa / Chờ duyệt</Tag>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Chức vụ">
                                    <Text strong>{getRoleName(groupStr)}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phòng ban / Đơn vị">
                                    {getDepartment(groupStr)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Email liên hệ">{selectedUser.email || "Chưa cập nhật"}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">{phone ? formatPhoneNumber(phone) : "Chưa cập nhật"}</Descriptions.Item>
                                <Descriptions.Item label="Số CMND / CCCD">{idNum}</Descriptions.Item>
                            </Descriptions>
                        </div>
                    );
                })()}
            </Modal>
        </Flex>
    );
}