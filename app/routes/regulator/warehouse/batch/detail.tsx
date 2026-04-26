import { Card, Layout, Row, Col, Tag, Button, Flex, message, Modal, Spin, Typography, Timeline, List, Table, Image } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi"; 
import { organizationApi } from "api/organizationApi"; 
import { InfoRow } from "components/InfoRow/InfoRow";
import SupplyChainStep from "components/SupplyChainStep/SupplyChainStep";
import { QRCodeCell } from "components/QRCodeCall/QRCodeCall";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router";
import dayjs from "dayjs";
import { CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined, FileTextOutlined, EyeOutlined } from "@ant-design/icons";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const { Text } = Typography;

const qcStatusMap: Record<string, { color: string; label: string }> = {
    PASSED: { color: "green", label: "Đạt chuẩn" },
    FAILED: { color: "red", label: "Không đạt" },
    PENDING: { color: "orange", label: "Chờ kiểm định" }
};

const boxStatusMap: Record<string, { color: string; label: string }> = {
    PRODUCED: { color: "gold", label: "Đã sản xuất" },
    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
    IN_STORAGE: { color: "cyan", label: "Lưu kho" },
    SOLD: { color: "green", label: "Đã bán" },
    RECALLED: { color: "volcano", label: "Thu hồi" },
    RETURNED: { color: "purple", label: "Đã trả lại" },
};

const batchStatusMap: Record<string, { color: string; label: string }> = {
    PRODUCED: { color: "gold", label: "Đã sản xuất" },
    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
    STORED: { color: "cyan", label: "Lưu kho" },
    DISTRIBUTED: { color: "green", label: "Đã phân phối" },
    RECALLED: { color: "volcano", label: "Thu hồi" },
    RETURNED: { color: "purple", label: "Đã trả lại" },
};

export default function RegulatorBatchDetail() {
    const { id } = useParams();
    const { setHeaderActions } = useHeaderActions();
    
    const [batchDetail, setBatchDetail] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    
    // States cho dữ liệu hiển thị
    const [drugName, setDrugName] = useState<string>("Đang tải...");
    const [orgName, setOrgName] = useState<string>("Đang tải...");
    const [facilityName, setFacilityName] = useState<string>("Đang tải...");
    const [boxes, setBoxes] = useState([]);
    const [loadingBoxes, setLoadingBoxes] = useState(false);

    // States cho Modal Lịch sử
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // States cho Modal Tài liệu QC
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    // 1. Kéo dữ liệu Lô thuốc
    const fetchBatchDetail = useCallback(async () => {
        try {
            const result = await drugBatchApi.getById(id || "");
            setBatchDetail(result.data || result);
        } catch (error) {
            message.error("Không thể tải thông tin chi tiết lô thuốc!");
        }
    }, [id]);

    // 2. Kéo danh sách Hộp thuốc (Boxes)
    const fetchBoxes = useCallback(async () => {
        setLoadingBoxes(true);
        try {
            const result = await drugBatchApi.getBoxByBatchId({
                page: 1, size: 100, batchId: id || ""
            });
            setBoxes(result.data || result.content || []);
        } catch (error) {
            console.error("Fetch boxes error:", error);
        } finally {
            setLoadingBoxes(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchBatchDetail();
            fetchBoxes();
        }
    }, [id, fetchBatchDetail, fetchBoxes]);

    // 3. Đắp thêm tên Thuốc, Tổ chức, Cơ sở
    useEffect(() => {
        if (batchDetail) {
            const fetchNames = async () => {
                try {
                    if (batchDetail.drugId) {
                        const profile = await drugProfileApi.getById(batchDetail.drugId);
                        setDrugName(profile?.data?.drugName || profile?.drugName || batchDetail.drugId);
                    }
                } catch (e) { setDrugName(batchDetail.drugId); }

                try {
                    if (batchDetail.manufacturerOrgId) {
                        const org = await organizationApi.getById(batchDetail.manufacturerOrgId);
                        setOrgName(org?.data?.orgName || org?.orgName || batchDetail.manufacturerOrgId);
                    }
                } catch (e) { setOrgName(batchDetail.manufacturerOrgId); }

                try {
                    if (batchDetail.manufacturerOrgId && batchDetail.manufacturerFacilityId) {
                        const facRes = await organizationApi.getFacilities(batchDetail.manufacturerOrgId);
                        const facilities = facRes?.data || facRes || [];
                        const found = facilities.find((f: any) => f.facilityId === batchDetail.manufacturerFacilityId);
                        setFacilityName(found ? found.facilityName : batchDetail.manufacturerFacilityId);
                    }
                } catch (e) { setFacilityName(batchDetail.manufacturerFacilityId); }
            };
            fetchNames();
        }
    }, [batchDetail]);

    // 4. Kéo Lịch sử Blockchain
    useEffect(() => {
        if (isHistoryVisible) {
            const fetchHistory = async () => {
                setLoadingHistory(true);
                try {
                    const res = await drugBatchApi.getHistory(id!);
                    const data = res.data || res || [];
                    setHistoryData([...data].reverse()); 
                } catch (error) {
                    message.error("Lỗi tải lịch sử truy vết!");
                } finally {
                    setLoadingHistory(false);
                }
            };
            fetchHistory();
        }
    }, [isHistoryVisible, id]);

    // 🌟 HÀM XỬ LÝ TÀI LIỆU QC
    const handleOpenDocuments = async () => {
        if (!id) return;
        setIsDocModalOpen(true);
        setLoadingDocs(true);
        try {
            const res = await drugBatchApi.getDocuments(id);
            let docList = Array.isArray(res) ? res : (res?.data || []);
            setDocuments(docList);
            if (docList.length === 0 || (docList.length === 1 && docList[0] === "no_document")) {
                message.warning("Lô thuốc này chưa có hồ sơ QC nào được đính kèm!");
                setDocuments([]);
            }
        } catch (error) {
            message.error("Không thể tải danh sách tài liệu đính kèm!");
            setDocuments([]);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handlePreviewFile = async (filename: string) => {
        if (!id) return;
        const hide = message.loading(`Đang tải file ${filename}...`, 0);
        try {
            const blob = await drugBatchApi.getPreviewDocument(id, filename);
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            message.error("Có lỗi khi mở file. File có thể không tồn tại hoặc lỗi mạng.");
        } finally {
            hide();
        }
    };

    // 🌟 HÀM DUYỆT / TỪ CHỐI LÔ THUỐC
    const handleUpdateQC = async (status: string) => {
        Modal.confirm({
            title: status === "PASSED" ? "Xác nhận ĐẠT kiểm định?" : "Xác nhận KHÔNG ĐẠT kiểm định?",
            content: "Kết quả kiểm định sẽ được lưu vĩnh viễn trên hệ thống Blockchain.",
            okType: status === "FAILED" ? "danger" : "primary",
            onOk: async () => {
                setActionLoading(true);
                try {
                    await drugBatchApi.updateQCStatus(id!, status);
                    message.success(`Đã cập nhật trạng thái QC: ${qcStatusMap[status].label}`);
                    fetchBatchDetail();
                } catch (error) {
                    message.error("Lỗi khi cập nhật kiểm định!");
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    // Tạo thanh tiến trình (Supply Chain Step)
    const currentStep = useMemo(() => {
        if (!batchDetail?.status) return 0;
        switch (batchDetail.status) {
            case "PRODUCED": return 0;
            case "IN_TRANSIT": return 1;
            case "STORED": return 2;
            case "DISTRIBUTED": return 3;
            default: return 0;
        }
    }, [batchDetail?.status]);

    // Các nút Header
    useEffect(() => {
        if (!batchDetail) return;
        setHeaderActions(
            <Flex gap="small" align="center">
                <Button type="default" size="large" icon={<HistoryOutlined />} onClick={() => setIsHistoryVisible(true)}>
                    Lịch sử vận chuyển
                </Button>

                {batchDetail.qcStatus === "PENDING" && (
                    <>
                        <Button danger size="large" icon={<CloseCircleOutlined />} loading={actionLoading} onClick={() => handleUpdateQC("FAILED")}>
                            Không đạt
                        </Button>
                        <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} size="large" icon={<CheckCircleOutlined />} loading={actionLoading} onClick={() => handleUpdateQC("PASSED")}>
                            Đạt chuẩn
                        </Button>
                    </>
                )}
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, batchDetail, actionLoading]); 

    // Cấu hình cột cho bảng Hộp thuốc
    const columns = [
        { 
            title: "Mã hộp", 
            dataIndex: "boxId",
            key: "boxId",
            render: (boxId: string) => (
                <QRCodeCell batchId={id || ""} boxId={boxId} baseUrl={API_BASE_URL} />
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "status", 
            key: "status",
            render: (status: string) => {
                const config = boxStatusMap[status] || { color: "default", label: status || "Không rõ" };
                return <Tag color={config.color} style={{ borderRadius: '4px', padding: '2px 10px' }}>{config.label}</Tag>;
            }
        },
        {
            title: "Hành động",
            key: "action",
            render: (record: any) => (
                <Link to={`/regulator/batch/${id}/${record.boxId}`} style={{ color: '#1890ff' }}>Xem chi tiết</Link>
            )
        }
    ];

    if (!batchDetail) return <Flex justify="center" align="center" style={{ height: '80vh' }}><Spin size="large" /></Flex>;

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Flex vertical align="center" gap={16}>
                {/* 🌟 1. THANH TIẾN TRÌNH */}
                <SupplyChainStep current={currentStep} isRecalled={batchDetail.status === "RECALLED"} />
                
                <Row gutter={24} style={{ width: "100%" }}>
                    
                    {/* 🌟 2. CỘT TRÁI: THÔNG TIN CHI TIẾT & KIỂM ĐỊNH QC */}
                    <Col xs={24} lg={10}>
                        <Card title="Hồ sơ kiểm định lô thuốc (QC)">
                            <InfoRow 
                                label="Mã QR Lô" 
                                value={(
                                    <div style={{ marginTop: '-8px' }}>
                                        <Image
                                            width={100}
                                            height={100}
                                            src={`${API_BASE_URL}/files/preview?objectName=${`qrcode/${batchDetail.batchId}/batch.jpg`}`}
                                            fallback="https://via.placeholder.com/100?text=No+QR"
                                        />
                                    </div>
                                ) as any} 
                            />
                            <InfoRow
                                label="Trạng thái hàng"
                                value={(<Tag color={batchStatusMap[batchDetail.status]?.color || "default"}>
                                    {batchStatusMap[batchDetail.status]?.label || batchDetail.status}
                                </Tag>) as any}
                            />
                            <InfoRow label="Sản phẩm" value={(<span><Text strong style={{ color: '#1677ff' }}>{drugName}</Text></span>) as any} />
                            <InfoRow label="Tổ chức sản xuất" value={orgName} />
                            <InfoRow label="Cơ sở sản xuất" value={(<span><Text strong>{facilityName}</Text></span>) as any} />
                            <InfoRow label="Số hộp" value={`${batchDetail.totalBoxes || boxes.length} hộp`} />
                            <InfoRow label="Ngày sản xuất" value={batchDetail.productionDate ? dayjs(batchDetail.productionDate).format("DD/MM/YYYY") : "N/A"} />
                            <InfoRow label="Hạn sử dụng" value={batchDetail.expiryDate ? dayjs(batchDetail.expiryDate).format("DD/MM/YYYY") : "N/A"} />
                            
                            {/* Nút Xem Hồ sơ QC */}
                            <InfoRow 
                                label="Hồ sơ QC đính kèm" 
                                value={
                                    <Button type="dashed" icon={<FileTextOutlined />} size="small" onClick={handleOpenDocuments}>
                                        Xem tài liệu đính kèm
                                    </Button> as any
                                } 
                            />
                            
                            <div style={{ marginTop: 24, padding: 16, background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                                <InfoRow 
                                    label="TRẠNG THÁI KIỂM ĐỊNH" 
                                    value={
                                        <Tag color={qcStatusMap[batchDetail.qcStatus]?.color} style={{ fontSize: 16, padding: '4px 12px' }}>
                                            {qcStatusMap[batchDetail.qcStatus]?.label || batchDetail.qcStatus}
                                        </Tag> as any
                                    } 
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* 🌟 3. CỘT PHẢI: BẢNG DANH SÁCH HỘP THUỐC */}
                    <Col xs={24} lg={14} style={{ marginTop: 16 }}>
                        <Card title={`Danh sách hộp thuốc thuộc lô (${boxes.length})`}>
                            <Table
                                columns={columns}
                                dataSource={boxes}
                                loading={loadingBoxes}
                                pagination={{ pageSize: 5 }}
                                rowKey="boxId"
                                scroll={{ x: 500 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </Flex>

            {/* ============================================================== */}
            {/* CÁC MODAL HIỂN THỊ */}
            {/* ============================================================== */}

            {/* MODAL LỊCH SỬ VÒNG ĐỜI (Lấy từ Manufacturer) */}
            <Modal
                title={`Lịch sử vòng đời lô thuốc: ${id}`}
                open={isHistoryVisible}
                onCancel={() => setIsHistoryVisible(false)}
                footer={null}
                width={700}
            >
                {loadingHistory ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}><Spin tip="Đang truy xuất Blockchain..." /></Flex>
                ) : historyData.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>Chưa có dữ liệu lịch sử.</p>
                ) : (
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px 24px 16px 8px' }}>
                        <Timeline mode="left">
                            {historyData.map((item, index) => (
                                <Timeline.Item 
                                    key={item.txId} 
                                    color={index === 0 ? "green" : "blue"}
                                    label={<Text strong>{dayjs(item.timestamp).format("DD/MM/YYYY HH:mm:ss")}</Text>}
                                >
                                    <div style={{ padding: 16, backgroundColor: '#f9f9f9', borderRadius: 8, border: '1px solid #e8e8e8' }}>
                                        <div style={{ marginBottom: 12 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                <b>TxID:</b> <span style={{ wordBreak: 'break-all' }}>{item.txId}</span>
                                            </Text>
                                        </div>
                                        <Flex vertical gap="small">
                                            <InfoRow 
                                                label="Trạng thái hàng" 
                                                value={<Tag color="blue" style={{ margin: 0 }}>{batchStatusMap[item.data.status]?.label || item.data.status}</Tag> as any} 
                                            />
                                            <InfoRow 
                                                label="Kiểm định (QC)" 
                                                value={
                                                    <Tag color={qcStatusMap[item.data.qcStatus]?.color || "default"} style={{ margin: 0 }}>
                                                        {qcStatusMap[item.data.qcStatus]?.label || item.data.qcStatus}
                                                    </Tag> as any
                                                }
                                            />
                                        </Flex>
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </div>
                )}
            </Modal>

            <Modal
                title="Hồ sơ QC đính kèm"
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
                                    <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => handlePreviewFile(filename)}>
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

        </Layout.Content>
    );
}