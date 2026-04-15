import { Table, Tag, Space, Button, Tooltip, Popconfirm, Modal, Descriptions, Typography } from 'antd';
import { EyeOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Link } from 'react-router'; 
import { useState } from 'react';
import { formatPhoneNumber } from 'utils/phoneformat';

const { Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: "Đang hoạt động" },
    INACTIVE: { color: "default", label: "Ngừng hoạt động" },
    SUSPENDED: { color: "red", label: "Bị đình chỉ" },
    PENDING: { color: "orange", label: "Chờ duyệt" }
};

const orgTypeMap: Record<string, { color: string; label: string }> = {
    MANUFACTURER: { color: "gold", label: "Nhà sản xuất" },
    DISTRIBUTOR: { color: "blue", label: "Nhà phân phối" },
    PHARMACY: { color: "cyan", label: "Nhà thuốc / Bán lẻ" },
    HOSPITAL: { color: "green", label: "Bệnh viện" },
    REGULATOR: { color: "purple", label: "Cơ quan Quản lý" }
};

export default function CompanyTable({ dataSource, loading, pagination, onChange, onApprove, onSuspend }: any) {
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);

    const showApproveModal = (record: any) => {
        setSelectedOrg(record);
        setIsApproveModalOpen(true);
    };

    const handleCancel = () => {
        setIsApproveModalOpen(false);
        setSelectedOrg(null);
    };

    const handleConfirmApprove = () => {
        if (selectedOrg && onApprove) {
            onApprove(selectedOrg.orgId);
        }
        setIsApproveModalOpen(false);
    };

    const columns = [
        { title: 'Tên tổ chức', dataIndex: 'orgName', key: 'orgName' },
        { title: 'Mã số thuế', dataIndex: 'taxCode', key: 'taxCode' },
        { title: 'Số giấy phép', dataIndex: 'licenseNumber', key: 'licenseNumber' },
        { 
            title: 'Loại hình', 
            dataIndex: 'orgType', 
            key: 'orgType',
            render: (type: string) => {
                const config = orgTypeMap[type] || { color: 'default', label: type };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_: any, record: any) => (
                <div style={{ fontSize: '13px' }}>
                    <div>{formatPhoneNumber(record.contactPhone)}</div>
                    <div>{record.contactEmail}</div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config = statusMap[status] || { color: "default", label: status || "Không rõ" };
                return <Tag color={config.color} style={{ borderRadius: '4px' }}>{config.label}</Tag>;
            }
        },

        {
            title: 'Hành động',
            key: 'action',
            align: 'center' as const,
            render: (_: any, record: any) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Link 
                            to={`/regulator/company/${record.orgId}`}
                            state={{ companyName: record.orgName }}
                        >
                            <Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }} />
                        </Link>
                    </Tooltip>

                    {record.status === 'PENDING' && (
                        <Tooltip title="Kiểm duyệt hồ sơ">
                            <Button 
                                type="text" 
                                icon={<CheckCircleOutlined />} 
                                style={{ color: '#52c41a' }} 
                                onClick={() => showApproveModal(record)} 
                            />
                        </Tooltip>
                    )}

                    {record.status === 'ACTIVE' && (
                        <Tooltip title="Đình chỉ hoạt động">
                            <Popconfirm
                                title="Đình chỉ tổ chức này?"
                                description="Tổ chức này sẽ bị khóa mọi giao dịch trên hệ thống. Xác nhận đình chỉ?"
                                onConfirm={() => onSuspend && onSuspend(record.orgId)}
                                okText="Đình chỉ"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button type="text" danger icon={<StopOutlined />} />
                            </Popconfirm>
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    return (
        <>
            <Table 
                columns={columns} 
                dataSource={dataSource} 
                loading={loading}
                pagination={pagination}
                onChange={onChange}
                rowKey="orgId"
            />

            <Modal
                title="Kiểm duyệt hồ sơ tổ chức"
                open={isApproveModalOpen}
                onCancel={handleCancel}
                width={800}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        Đóng
                    </Button>,
                    <Button key="submit" type="primary" style={{ backgroundColor: '#52c41a' }} onClick={handleConfirmApprove}>
                        Xác nhận Duyệt
                    </Button>,
                ]}
            >
                {selectedOrg && (
                    <Descriptions 
                        bordered 
                        column={2} 
                        size="small" 
                        style={{ marginTop: 16 }}
                        labelStyle={{ fontWeight: 600, width: '140px', backgroundColor: '#f5f5f5' }}
                    >
                        <Descriptions.Item label="Tên tổ chức" span={2}>
                            <b style={{ color: '#1677ff', fontSize: 16 }}>{selectedOrg.orgName}</b>
                        </Descriptions.Item>
                        
                        <Descriptions.Item label="Loại hình">
                            <Tag color={orgTypeMap[selectedOrg.orgType]?.color || 'default'}>
                                {orgTypeMap[selectedOrg.orgType]?.label || selectedOrg.orgType}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color="orange">Chờ duyệt</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Mã số thuế">{selectedOrg.taxCode}</Descriptions.Item>
                        <Descriptions.Item label="Số giấy phép">{selectedOrg.licenseNumber}</Descriptions.Item>

                        <Descriptions.Item label="Email">{selectedOrg.contactEmail}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{selectedOrg.contactPhone}</Descriptions.Item>

                        <Descriptions.Item label="Địa chỉ trụ sở" span={2}>{selectedOrg.address}</Descriptions.Item>
                        
                        <Descriptions.Item label="Tệp đính kèm" span={2}>
                            <Text type="secondary" style={{ fontSize: 12 }}>{selectedOrg.documentHashes}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </>
    );
}