import { PaperClipOutlined, CheckOutlined, CloseOutlined, EyeOutlined, CheckCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Flex, message, Space, Table, Tag, Popconfirm, Modal, Divider, Descriptions, Typography, List, Spin } from "antd";
import { useCallback, useEffect, useState } from "react";
import { organizationApi } from "api/organizationApi";
import dayjs from "dayjs";
import { formatPhoneNumber } from "utils/phoneformat";

const { Text, Title } = Typography;

const orgTypeMap: Record<string, { color: string; label: string }> = {
    MANUFACTURER: { color: "gold", label: "Nhà sản xuất" },
    DISTRIBUTOR: { color: "blue", label: "Nhà phân phối" },
    PHARMACY: { color: "cyan", label: "Nhà thuốc / Bán lẻ" },
    HOSPITAL: { color: "green", label: "Bệnh viện" },
    REGULATOR: { color: "purple", label: "CQ Quản lý" }
};

export default function RegulatorCompanyApprove() {
    const [pendingOrgs, setPendingOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>("");

    const fetchPendingOrgs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await organizationApi.getAll({ 
                page: 0, 
                size: 100
            });
            const allData = response.data || response.content || [];
            
            const waitlist = allData.filter((org: any) => org.status === "PENDING");
            setPendingOrgs(waitlist);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách hồ sơ chờ duyệt!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingOrgs();
    }, [fetchPendingOrgs]);

    const showDetailModal = (record: any) => {
        setSelectedOrg(record);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrg(null);
    };

    const handleOpenDocuments = async (orgId: string) => {
        setIsDocModalOpen(true);
        setLoadingDocs(true);
        try {
            const res = await organizationApi.getDocuments(orgId);
            let docList = Array.isArray(res) ? res : (res?.data || []);
            setDocuments(docList);
            
            if (docList.length === 0 || (docList.length === 1 && docList[0] === "no_document")) {
                message.warning("Tổ chức này chưa đính kèm hồ sơ pháp lý nào!");
                setDocuments([]); 
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách file:", error);
            message.error("Không thể tải danh sách tài liệu đính kèm!");
            setDocuments([]);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handlePreviewFile = async (filename: string) => {
        if (!selectedOrg?.orgId) return;
        const hide = message.loading(`Đang mở file ${filename}...`, 0);
        try {
            const blob = await organizationApi.getPreviewDocument(selectedOrg.orgId, filename);
            const fileURL = URL.createObjectURL(blob);
            
            setPreviewUrl(fileURL);
            setPreviewTitle(filename);
            
        } catch (error) {
            console.error("Lỗi preview file:", error);
            message.error("Có lỗi khi mở file. File có thể không tồn tại hoặc lỗi mạng.");
        } finally {
            hide();
        }
    };

    const handleApprove = async (orgId: string) => {
        try {
            setActionLoading(orgId);
            await organizationApi.updateStatus(orgId, "ACTIVE");
            message.success("Đã duyệt hồ sơ tổ chức thành công!");
            setPendingOrgs(prev => prev.filter(org => org.orgId !== orgId));
            closeModal();
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi duyệt tổ chức!");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (orgId: string) => {
        message.info("Đã từ chối hồ sơ!");
        setPendingOrgs(prev => prev.filter(org => org.orgId !== orgId));
        closeModal();
    };

    const columns = [
        {
            title: 'Tên tổ chức',
            dataIndex: 'orgName',
            key: 'orgName',
            fontWeight: 500,
        },
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
            title: 'Mã số thuế',
            dataIndex: 'taxCode',
            key: 'taxCode',
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
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm")
        },
        {
            title: 'Tài liệu đính kèm',
            key: 'documents',
            render: (_: any, record: any) => {
                return (
                    <Button 
                        type="dashed" 
                        icon={<PaperClipOutlined />} 
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrg(record);
                            handleOpenDocuments(record.orgId);
                        }}
                    >
                        Xem hồ sơ 
                    </Button>
                );
            }
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
                        title="Xem chi tiết"
                    />

                    <Popconfirm
                        title="Duyệt hồ sơ?"
                        onConfirm={() => handleApprove(record.orgId)}
                        okText="Duyệt ngay"
                        cancelText="Hủy"
                    >
                        <Button 
                            type="text" 
                            style={{ color: '#52c41a' }} 
                            icon={<CheckCircleOutlined />} 
                            loading={actionLoading === record.orgId}
                            title="Duyệt công ty này"
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
                dataSource={pendingOrgs} 
                loading={loading}
                rowKey="orgId"
                locale={{ emptyText: "Không có hồ sơ công ty/tổ chức nào đang chờ duyệt" }}
                pagination={{ pageSize: 10 }}
            />
            
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Kiểm duyệt hồ sơ đăng ký</Title>}
                open={isModalOpen}
                onCancel={closeModal}
                width={800}
                centered
                footer={[
                    <Button key="back" onClick={closeModal}>
                        Đóng
                    </Button>,
                    <Popconfirm
                        key="reject"
                        title="Bạn chắc chắn muốn từ chối?"
                        onConfirm={() => handleReject(selectedOrg?.orgId)}
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
                        loading={actionLoading === selectedOrg?.orgId}
                        onClick={() => handleApprove(selectedOrg?.orgId)}
                    >
                        Phê duyệt
                    </Button>,
                ]}
            >
                {selectedOrg && (
                    <div style={{ marginTop: 24 }}>
                        <Descriptions 
                            bordered 
                            column={2} 
                            size="small" 
                            labelStyle={{ fontWeight: 600, width: '140px', backgroundColor: '#f9f9f9' }}
                        >
                            <Descriptions.Item label="Tên tổ chức" span={2}>
                                <Text strong style={{ color: '#1677ff', fontSize: 16 }}>{selectedOrg.orgName}</Text>
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
                            <Descriptions.Item label="Số điện thoại">{formatPhoneNumber(selectedOrg.contactPhone)}</Descriptions.Item>

                            <Descriptions.Item label="Địa chỉ trụ sở" span={2}>{selectedOrg.address}</Descriptions.Item>
                            
                            <Descriptions.Item label="Ngày nộp hồ sơ">
                                {dayjs(selectedOrg.createdAt).format("DD/MM/YYYY HH:mm:ss")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tài liệu đính kèm">
                                <Button 
                                    type="dashed" 
                                    icon={<FileTextOutlined />} 
                                    size="small" 
                                    onClick={() => handleOpenDocuments(selectedOrg.orgId)}
                                >
                                    Xem hồ sơ đính kèm
                                </Button>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider dashed />
                        <Text type="secondary" style={{ fontStyle: 'italic', fontSize: 13 }}>
                            * Lưu ý: Việc phê duyệt sẽ cấp quyền cho tổ chức này tham gia trực tiếp vào mạng lưới Blockchain. Vui lòng kiểm tra kỹ các thông tin pháp lý.
                        </Text>
                    </div>
                )}
            </Modal>

            <Modal
                title={`Hồ sơ pháp lý: ${selectedOrg?.orgName || 'Đang tải'}`}
                open={isDocModalOpen}
                onCancel={() => setIsDocModalOpen(false)}
                footer={<Button onClick={() => setIsDocModalOpen(false)}>Đóng</Button>}
                destroyOnClose
            >
                {loadingDocs ? (
                    <Flex justify="center" style={{ padding: 24 }}>
                        <Spin tip="Đang tải danh sách tài liệu..." />
                    </Flex>
                ) : (
                    <List
                        dataSource={documents}
                        locale={{ emptyText: "Không có tài liệu nào được đính kèm." }}
                        renderItem={(filename) => (
                            <List.Item
                                actions={[
                                    <Button 
                                        type="primary" 
                                        icon={<EyeOutlined />} 
                                        size="small" 
                                        onClick={() => handlePreviewFile(filename)}
                                    >
                                        Xem tài liệu
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                                    title={<Text strong>{filename}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
            <Modal
                title={`Hồ sơ pháp lý: ${selectedOrg?.orgName || 'Đang tải'}`}
                open={!!previewUrl}
                onCancel={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }}
                footer={null}
                width={1000}
                style={{ top: 20 }}
                destroyOnClose
            >
                {previewUrl && (
                    previewTitle.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                            src={previewUrl} 
                            width="100%" 
                            height="700px"
                            style={{ border: 'none', borderRadius: 8 }} 
                            title="Preview PDF"
                        />
                    ) : (
                        <Flex justify="center" align="center" style={{ width: '100%', minHeight: '500px' }}>
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                style={{ maxWidth: '100%', maxHeight: '800px', objectFit: 'contain' }} 
                            />
                        </Flex>
                    )
                )}
            </Modal>
            <Modal
                title={`Hồ sơ pháp lý: ${selectedOrg?.orgName || 'Đang tải'}`}
                open={!!previewUrl}
                onCancel={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                }}
                footer={null}
                width={1000}
                style={{ top: 20 }}
                destroyOnClose
            >
                {previewUrl && (
                    previewTitle.toLowerCase().endsWith('.pdf') ? (
                        <iframe 
                            src={previewUrl} 
                            width="100%" 
                            height="700px"
                            style={{ border: 'none', borderRadius: 8 }} 
                            title="Preview PDF"
                        />
                    ) : (
                        <Flex justify="center" align="center" style={{ width: '100%', minHeight: '500px' }}>
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                style={{ maxWidth: '100%', maxHeight: '800px', objectFit: 'contain' }} 
                            />
                        </Flex>
                    )
                )}
            </Modal>
        </div>
    );
}