import { Col, Flex, Row, Tag, Typography, Button, Spin, message, Modal, List } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons"; 
import { drugProfileApi } from "api/drugProfileApi";
import { organizationApi } from "api/organizationApi";
import { drugBatchApi } from "api/drugBatchApi";
import BorderCard from "components/Card/BorderCard";
import BatchTable from "components/Table/BatchTable";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router";
import dayjs from "dayjs";
import { useAuth } from "auth/useAuth";

const { Title, Text } = Typography;

export default function MedicineDetail() {
    const { drugId } = useParams<{ drugId: string }>();
    const location = useLocation();
    
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); 
    const [medicineDetail, setMedicineDetail] = useState<any>(location.state || null);
    
    const [orgName, setOrgName] = useState<string>("Đang tải dữ liệu...");
    const [batches, setBatches] = useState<any[]>([]);
    const [loadingBatches, setLoadingBatches] = useState(false);
    const { user } = useAuth(); 

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const batchColumns = [
        { title: 'Mã lô', dataIndex: 'batchId', key: 'batchId', render: (text: string) => <Text strong>{text}</Text> },
        { title: 'Số lượng hộp', dataIndex: 'totalBoxes', key: 'totalBoxes' },
        { 
            title: 'Ngày sản xuất', 
            dataIndex: 'productionDate', 
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '—'
        },
        { 
            title: 'Hạn sử dụng', 
            dataIndex: 'expiryDate', 
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '—'
        },
        {
            title: 'Kiểm định (QC)',
            dataIndex: 'qcStatus',
            render: (status: string) => {
                if (status === 'PASSED') return <Tag color="success">Đạt chuẩn</Tag>;
                if (status === 'FAILED') return <Tag color="error">Không đạt</Tag>;
                return <Tag color="warning">Chờ kiểm định</Tag>;
            }
        },
        { 
            title: 'Trạng thái lô', 
            dataIndex: 'status', 
            render: (status: string) => {
                const statusMap: Record<string, { color: string, label: string }> = {
                    PRODUCED: { color: "gold", label: "Vừa sản xuất" },
                    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
                    STORED: { color: "green", label: "Đang lưu kho" },
                    DISTRIBUTED: { color: "cyan", label: "Đã phân phối" },
                    RECALLED: { color: "red", label: "Bị thu hồi" }
                };
                const config = statusMap[status] || { color: "default", label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => <Button type="link" size="small">Xem chi tiết »</Button>,
        },
    ];

    const currentStatus = medicineDetail.approveStatus || 'PENDING'; 
    const isPending = currentStatus === 'PENDING' || currentStatus === 'INACTIVE' || currentStatus === 'WAITING';
    const isActive = currentStatus === 'ACTIVE' || currentStatus === 'APPROVED' || currentStatus === 'PASSED';
    const isRejected = currentStatus === 'REJECTED' || currentStatus === 'FAILED';

    const handleUpdateStatus = (status: 'APPROVED' | 'REJECTED') => {
        const isApprove = status === 'APPROVED';
        Modal.confirm({
            title: isApprove ? 'Xác nhận cấp phép hồ sơ thuốc này?' : 'Từ chối cấp phép hồ sơ thuốc này?',
            content: isApprove 
                ? 'Sau khi phê duyệt, Nhà sản xuất có thể bắt đầu tạo Lô thuốc dựa trên hồ sơ này.' 
                : 'Hồ sơ sẽ bị đánh dấu Từ chối và không thể sử dụng để sản xuất.',
            okText: isApprove ? 'Phê duyệt' : 'Từ chối',
            cancelText: 'Hủy',
            okType: isApprove ? 'primary' : 'danger',
            onOk: async () => {
                setActionLoading(true);
                try {
                    await drugProfileApi.updateStatus(medicineDetail.drugId, status);
                    message.success(`Đã ${isApprove ? 'phê duyệt' : 'từ chối'} hồ sơ thuốc thành công!`);
                    
                    setMedicineDetail((prev: any) => ({ ...prev, approveStatus: status }));
                } catch (error) {
                    console.error(error);
                    message.error('Có lỗi xảy ra khi cập nhật trạng thái!');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (!drugId) { setLoading(false); return; }

            try {
                setLoading(true);

                const res = await drugProfileApi.getById(drugId);
                let rawData = res.data || res.content || res;
                
                const currentDetail = Array.isArray(rawData) ? rawData[0] : rawData;
                
                setMedicineDetail(currentDetail);
                if (currentDetail && currentDetail.manufacturerOrgId) {
                    setLoadingBatches(true);
                    
                    const fetchOrgName = async () => {
                        if (currentDetail.manufacturerOrgId === user?.orgId) {
                            setOrgName(user?.orgId || "Tổ chức của bạn");
                            return;
                        }
                        try {
                            if (typeof organizationApi.getById !== 'function') {
                                setOrgName(currentDetail.manufacturerOrgId); return;
                            }
                            const orgRes = await organizationApi.getById(currentDetail.manufacturerOrgId);
                            setOrgName(orgRes.data?.orgName || orgRes.orgName || currentDetail.manufacturerOrgId);
                        } catch (error) {
                            setOrgName(currentDetail.manufacturerOrgId);
                        }
                    };

                    const fetchBatches = async () => {
                        try {
                            const batchesRes = await drugBatchApi.getAll({ 
                                orgId: currentDetail.manufacturerOrgId, page: 0, size: 100 
                            });
                            const allBatches = batchesRes.data || batchesRes.content || batchesRes || [];
                            setBatches(allBatches.filter((b: any) => b.drugId === drugId));
                        } catch (error) { setBatches([]); }
                    };

                    await Promise.all([fetchOrgName(), fetchBatches()]);
                } else {
                    setOrgName("Hồ sơ thuốc chưa có mã Nhà sản xuất (manufacturerOrgId)");
                }
            } catch (error) {
                console.error("Lỗi API getById:", error);
                message.error("Không thể tải thông tin thuốc từ máy chủ!");
            } finally {
                setLoading(false);
                setLoadingBatches(false);
            }
        };

        fetchAllData();
    }, [drugId, user]);

    const handleOpenDocuments = async () => {
        const targetId = drugId || medicineDetail?.drugId || medicineDetail?.id;

        if (!targetId) {
            message.error("Lỗi: Hệ thống không xác định được Mã hồ sơ thuốc (ID) để tìm file!");
            console.error("Trạng thái hiện tại:", { drugId_Tu_URL: drugId, data_Chi_Tiet: medicineDetail });
            return;
        }

        setIsDocModalOpen(true);
        setLoadingDocs(true);
        try {
            const res = await drugProfileApi.getDocuments(targetId);
            
            let docList = [];
            if (Array.isArray(res)) {
                docList = res;
            } else if (res && Array.isArray(res.data)) {
                docList = res.data;
            }

            setDocuments(docList);
            
            if (docList.length === 0) {
                message.warning("Hồ sơ này chưa có tài liệu nào được đính kèm!");
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
        const targetId = drugId || medicineDetail?.drugId || medicineDetail?.id;
        if (!targetId) return;

        const hide = message.loading(`Đang tải file ${filename}...`, 0);
        try {
            const blob = await drugProfileApi.getPreviewDocument(targetId, filename);
            
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
            
        } catch (error) {
            console.error("Lỗi preview file:", error);
            message.error("Có lỗi khi mở file. File có thể không tồn tại hoặc lỗi mạng.");
        } finally {
            hide();
        }
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: '100vh' }}>
                <Spin size="large" tip="Đang truy xuất dữ liệu từ Blockchain..." />
            </Flex>
        );
    }

    if (!medicineDetail) return <div style={{ padding: 24 }}>Không tìm thấy hồ sơ thuốc này.</div>;

    return (
        <div style={{ padding: '8px'}}>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={14}>
                    <BorderCard title="Nhà sản xuất">
                        <Flex justify="space-between" align="center" style={{ padding: 16 }}>
                            <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{orgName}</Text>
                        </Flex>
                    </BorderCard>
                </Col>

                <Col span={10}>
                    <BorderCard title="Trạng thái cấp phép">
                        <Flex vertical gap={16} style={{ padding: '16px' }}>
                            
                            <Flex style={{ width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
                                <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', textAlign: 'center', padding: '12px 0', backgroundColor: isPending ? '#e6f4ff' : 'transparent', color: isPending ? '#1677ff' : '#ccc', fontWeight: isPending ? 'bold' : 'normal' }}>
                                    Chờ duyệt
                                </div>
                                <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', textAlign: 'center', padding: '12px 0', backgroundColor: isActive ? '#f6ffed' : 'transparent', color: isActive ? '#52c41a' : '#ccc', fontWeight: isActive ? 'bold' : 'normal' }}>
                                    Đã duyệt
                                </div>
                                <div style={{ flex: 1, textAlign: 'center', padding: '12px 0', backgroundColor: isRejected ? '#fff2f0' : 'transparent', color: isRejected ? '#ff4d4f' : '#ccc', fontWeight: isRejected ? 'bold' : 'normal' }}>
                                    Từ chối
                                </div>
                            </Flex>

                            {isPending && (
                                <Flex gap="middle" justify="center" style={{ marginTop: 8 }}>
                                    <Button 
                                        danger 
                                        size="large" 
                                        icon={<CloseCircleOutlined />} 
                                        onClick={() => handleUpdateStatus('REJECTED')}
                                        loading={actionLoading}
                                        style={{ flex: 1 }}
                                    >
                                        Từ chối cấp phép
                                    </Button>
                                    <Button 
                                        type="primary" 
                                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', flex: 1 }}
                                        size="large" 
                                        icon={<CheckCircleOutlined />} 
                                        onClick={() => handleUpdateStatus('APPROVED')}
                                        loading={actionLoading}
                                    >
                                        Cấp phép
                                    </Button>
                                </Flex>
                            )}

                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={14}>
                    <BorderCard title="Thông tin tổng quan">
                        <Row style={{ padding: 16 }}>
                            <Col span={8}>
                                <Title level={4} style={{ margin: 0 }}>{medicineDetail.drugType || '—'}</Title>
                                <Text type="secondary">Nhóm thuốc</Text>
                            </Col>
                            <Col span={8}>
                                <Title level={4} style={{ margin: 0 }}>{batches.length}</Title>
                                <Text type="secondary">Tổng số lô đã sản xuất</Text>
                            </Col>
                        </Row>
                    </BorderCard>
                    
                    <BorderCard title="Quy cách đóng gói & Bảo quản" style={{ marginTop: 16 }}>
                        <Flex vertical gap={8} style={{ padding: 16 }}>
                            <Text><b>Quy cách:</b> {medicineDetail.packaging || '—'}</Text>
                            <Text><b>Tiêu chuẩn:</b> {medicineDetail.qualityStandard || '—'}</Text>
                            <Text><b>Hạn sử dụng:</b> {medicineDetail.shelfLife ? `${medicineDetail.shelfLife} tháng` : '—'}</Text>
                        </Flex>
                    </BorderCard>
                </Col>

                <Col span={10}>
                    <BorderCard title="Thông tin pháp lý" style={{ height: '100%' }}>
                        <Flex vertical gap={12} style={{ padding: 16 }}>
                            <Text><b>Dạng bào chế:</b> <Tag color="blue">{medicineDetail.dosageForm || '—'}</Tag></Text>
                            <Text><b>Số đăng ký:</b> {medicineDetail.licenseNumber || '—'}</Text>
                            <Text><b>Quyết định số:</b> {medicineDetail.decisionNumber || '—'}</Text>
                            <Text><b>Ngày hết hạn giấy phép:</b> {medicineDetail.licenseExpiry ? dayjs(medicineDetail.licenseExpiry).format('DD/MM/YYYY') : '—'}</Text>
                        
                            <Button 
                                type="dashed" 
                                icon={<FileTextOutlined />} 
                                onClick={handleOpenDocuments}
                                style={{ marginTop: 8 }}
                            >
                                Xem tài liệu đính kèm
                            </Button>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={24}>
                     <BorderCard title="Thành phần chính">
                        <Flex justify="space-between" style={{ padding: 16, backgroundColor: '#fafafa', borderRadius: 8 }}>
                            <Text style={{ fontSize: 16 }}>{medicineDetail.ingredient || 'Chưa cập nhật thành phần'}</Text>
                            <Text strong style={{ fontSize: 16, color: '#cf1322' }}>{medicineDetail.strength}</Text>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <BorderCard title="Lịch sử Lô hàng">
                <BatchTable  
                    dataSource={batches}
                    columns={batchColumns}
                    loading={loadingBatches}
                    rowKey="batchId"
                />
            </BorderCard>

            <Modal
                title="Tài liệu đính kèm hồ sơ"
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
        </div>
    );
}