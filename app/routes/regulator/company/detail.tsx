import { BankOutlined, StopOutlined, CheckCircleOutlined, PaperClipOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Flex, Layout, message, Modal, Row, Spin, Tag, Typography, List } from "antd";
import { InfoRow } from "components/InfoRow/InfoRow";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { organizationApi } from "api/organizationApi";
import dayjs from "dayjs";
import BorderCard from "components/Card/BorderCard";

const { Title, Text } = Typography;

const orgTypeMap: Record<string, { color: string; label: string }> = {
    MANUFACTURER: { color: "gold", label: "Nhà sản xuất" },
    DISTRIBUTOR: { color: "blue", label: "Nhà phân phối" },
    PHARMACY: { color: "cyan", label: "Nhà thuốc / Bán lẻ" },
    HOSPITAL: { color: "green", label: "Bệnh viện" },
    REGULATOR: { color: "purple", label: "Cơ quan Quản lý" }
};

const statusMap: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: "Đang hoạt động" },
    INACTIVE: { color: "default", label: "Ngừng hoạt động" },
    SUSPENDED: { color: "red", label: "Bị đình chỉ" },
    PENDING: { color: "orange", label: "Chờ duyệt" }
};

export default function RegulatorCompanyDetail() {
    const { id } = useParams();
    const { setHeaderActions } = useHeaderActions();
    
    const [orgDetail, setOrgDetail] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>("");


    const fetchOrgDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await organizationApi.getById(id);
            setOrgDetail(response.data || response);
        } catch (error) {
            console.error("Lỗi lấy chi tiết tổ chức:", error);
            message.error("Không thể tải thông tin tổ chức!");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchOrgDetail();
    }, [fetchOrgDetail]);

    const handleUpdateStatus = async (newStatus: string) => {
        setActionLoading(true);
        try {
            await organizationApi.updateStatus(id!, newStatus);
            message.success(`Đã chuyển trạng thái tổ chức thành: ${statusMap[newStatus]?.label || newStatus}`);
            fetchOrgDetail(); // Load lại data mới nhất
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
        } finally {
            setActionLoading(false);
        }
    };

    const showSuspendConfirm = useCallback(() => {
        Modal.confirm({
            title: 'Đình chỉ hoạt động tổ chức',
            content: 'Bạn có chắc chắn muốn ĐÌNH CHỈ tổ chức này? Sau khi đình chỉ, họ sẽ không thể tạo lô thuốc hoặc thực hiện giao dịch trên hệ thống.',
            okText: 'Đình chỉ ngay',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: () => handleUpdateStatus("SUSPENDED"),
        });
    }, [id]);

    const showActivateConfirm = useCallback(() => {
        Modal.confirm({
            title: 'Kích hoạt lại tổ chức',
            content: 'Tổ chức này sẽ được khôi phục quyền hoạt động bình thường trên hệ thống. Bạn có chắc chắn?',
            okText: 'Kích hoạt',
            cancelText: 'Hủy',
            onOk: () => handleUpdateStatus("ACTIVE"),
        });
    }, [id]);

    // 🌟 HÀM MỞ MODAL VÀ LẤY DANH SÁCH FILE
    const handleOpenDocuments = async () => {
        if (!id) return;
        setIsDocModalOpen(true);
        setLoadingDocs(true);
        try {
            const res = await organizationApi.getDocuments(id);
            
            let docList = [];
            if (Array.isArray(res)) {
                docList = res;
            } else if (res && Array.isArray(res.data)) {
                docList = res.data;
            }

            setDocuments(docList);
            
            if (docList.length === 0) {
                message.warning("Tổ chức này chưa có tài liệu nào được đính kèm!");
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
        if (!id) return;
        const hide = message.loading(`Đang mở file ${filename}...`, 0);
        try {
            const blob = await organizationApi.getPreviewDocument(id, filename);
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

    useEffect(() => {
        if (!orgDetail) return;

        let actionButton = null;

        if (orgDetail.status === "ACTIVE") {
            actionButton = (
                <Button 
                    danger 
                    type="primary" 
                    size="large" 
                    icon={<StopOutlined />} 
                    onClick={showSuspendConfirm}
                    loading={actionLoading}
                >
                    Đình chỉ hoạt động
                </Button>
            );
        } else if (orgDetail.status === "SUSPENDED" || orgDetail.status === "INACTIVE") {
            actionButton = (
                <Button 
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: '#fff' }} 
                    size="large" 
                    icon={<CheckCircleOutlined />} 
                    onClick={showActivateConfirm}
                    loading={actionLoading}
                >
                    Kích hoạt hệ thống
                </Button>
            );
        }

        setHeaderActions(
            <Flex gap="small">
                {actionButton}
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions, orgDetail, showSuspendConfirm, showActivateConfirm, actionLoading]);

    if (loading || !orgDetail) {
        return <Flex justify="center" align="center" style={{ height: '80vh' }}><Spin size="large" /></Flex>;
    }

    const typeConfig = orgTypeMap[orgDetail.orgType] || { color: "default", label: orgDetail.orgType };
    const statusConfig = statusMap[orgDetail.status] || { color: "default", label: orgDetail.status };

    return (
        <Layout.Content className="contentLayoutTableLevel" style={{ padding: 16 }}>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <BorderCard style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ padding: 16 }}>
                            <Flex align="center" gap={16} style={{ marginBottom: 24 }}>
                                <Title level={3} style={{ margin: 0 }}>{orgDetail.orgName}</Title>
                            </Flex>

                            <Divider />

                            <Row gutter={48}>
                                <Col span={12}>
                                    <Title level={5} style={{ marginBottom: 16 }}>Thông tin pháp lý</Title>
                                    <InfoRow label="Trạng thái hệ thống" value={<Tag color={statusConfig.color} style={{ fontSize: 14, padding: '4px 8px' }}>{statusConfig.label}</Tag> as any} />
                                    <InfoRow label="Phân loại" value={<Tag color={typeConfig.color}>{typeConfig.label}</Tag> as any} />
                                    <InfoRow label="Mã số thuế" value={orgDetail.taxCode} />
                                    <InfoRow label="Giấy phép ĐKKD/GCN" value={orgDetail.licenseNumber} />
                                    <InfoRow label="Ngày tham gia hệ thống" value={dayjs(orgDetail.createdAt).format("DD/MM/YYYY HH:mm")} />
                                </Col>

                                <Col span={12}>
                                    <Title level={5} style={{ marginBottom: 16 }}>Thông tin liên hệ</Title>
                                    <InfoRow label="Số điện thoại" value={orgDetail.contactPhone || "Chưa cập nhật"} />
                                    <InfoRow label="Email đại diện" value={orgDetail.contactEmail || "Chưa cập nhật"} />
                                    <InfoRow label="Địa chỉ trụ sở chính" value={orgDetail.address || "Chưa cập nhật"} />
                                    
                                    <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Hồ sơ đính kèm</Title>
                                    
                                    {/* 🌟 NÚT XEM TÀI LIỆU (Thay cho việc render hash) */}
                                    <Button 
                                        type="dashed" 
                                        icon={<FileTextOutlined />} 
                                        onClick={handleOpenDocuments}
                                    >
                                        Xem tài liệu đính kèm (Quyết định, Giấy phép...)
                                    </Button>

                                </Col>
                            </Row>
                        </div>
                    </BorderCard>
                </Col>
            </Row>

            <Modal
                title={`Tài liệu đính kèm - ${orgDetail.orgName}`}
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
                                        Xem trước
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
                title={`Tài liệu đính kèm - ${orgDetail.orgName}`}
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
        </Layout.Content>
    );
}