import { Card, Layout, Row, Col, Table, Tag, Button, Flex, message, Modal, Spin, Typography, Image, Form, Input, Select, Timeline } from "antd";
import { HistoryOutlined } from "@ant-design/icons"; // 🌟 THÊM IMPORT ICON
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi"; 
import { organizationApi } from "api/organizationApi"; 
import { InfoRow } from "components/InfoRow/InfoRow";
import SupplyChainStep from "components/SupplyChainStep/SupplyChainStep";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router";
import dayjs from "dayjs";
import { useAuth } from "auth/useAuth";
import { QRCodeCell } from "components/QRCodeCall/QRCodeCall";

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

export default function BatchDetail() {
    const { id } = useParams();
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [transferring, setTransferring] = useState(false);
    const [boxes, setBoxes] = useState([]);
    const [batchDetail, setBatchDetail] = useState<any>(null);
    const [drugName, setDrugName] = useState<string>("Đang tải...");
    const [facilityName, setFacilityName] = useState<string>("Đang tải...");

    const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
    const [transferForm] = Form.useForm();
    const [orgList, setOrgList] = useState<any[]>([]);
    const [facilityList, setFacilityList] = useState<any[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [loadingFacilities, setLoadingFacilities] = useState(false);

    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchBatchDetail = useCallback(async () => {
        try {
            const result = await drugBatchApi.getById(id || "");
            setBatchDetail(result.data || result);
        } catch (error) {
            message.error("Không thể tải thông tin chi tiết lô thuốc!");
        }
    }, [id]);

    const fetchBox = useCallback(async () => {
        setLoading(true);
        try {
            const result = await drugBatchApi.getBoxByBatchId({
                page: 1, size: 100, batchId: id || ""
            });
            setBoxes(result.data || result.content || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchBatchDetail();
            fetchBox();
        }
    }, [id, fetchBatchDetail, fetchBox]);

    useEffect(() => {
        if (batchDetail) {
            const fetchDrugName = async () => {
                try {
                    const res = await drugProfileApi.getById(batchDetail.drugId);
                    setDrugName(res.data?.drugName || res.drugName || batchDetail.drugId);
                } catch (e) { setDrugName(batchDetail.drugId); }
            };

            const fetchFacilityName = async () => {
                if (!batchDetail.manufacturerOrgId) {
                    setFacilityName(batchDetail.manufacturerFacilityId);
                    return;
                }
                try {
                    const res = await organizationApi.getFacilities(batchDetail.manufacturerOrgId);
                    const facilities = res.data || res || [];
                    const found = facilities.find((f: any) => f.facilityId === batchDetail.manufacturerFacilityId);
                    setFacilityName(found ? found.facilityName : batchDetail.manufacturerFacilityId);
                } catch (e) { setFacilityName(batchDetail.manufacturerFacilityId); }
            };

            fetchDrugName();
            fetchFacilityName();
        }
    }, [batchDetail]);

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

    useEffect(() => {
        if (isTransferModalVisible) {
            const fetchOrgs = async () => {
                setLoadingOrgs(true);
                try {
                    const res = await organizationApi.getAll({ page: 0, size: 100 }); 
                    setOrgList(res.data || res.content || res || []);
                } catch (e) { message.error("Không thể tải danh sách tổ chức đối tác!"); } 
                finally { setLoadingOrgs(false); }
            };
            fetchOrgs();
        } else {
            setFacilityList([]); 
        }
    }, [isTransferModalVisible]);

    const handleOrgChange = async (orgId: string) => {
        transferForm.setFieldsValue({ toFacilityId: undefined });
        setFacilityList([]);
        if (!orgId) return;

        setLoadingFacilities(true);
        try {
            const res = await organizationApi.getFacilities(orgId);
            setFacilityList(res.data || res || []);
        } catch (e) { message.error("Không thể tải danh sách cơ sở!"); } 
        finally { setLoadingFacilities(false); }
    };

    const handleTransferSubmit = async (values: any) => {
        setTransferring(true);
        try {
            const payload = {
                batchId: id as string,
                toOrgId: values.toOrgId,
                toFacilityId: values.toFacilityId,
                note: values.note ? values.note : ""
            };
            
            await drugBatchApi.transfer(payload);
            
            message.success("Xuất lô thuốc thành công! Trạng thái đã chuyển sang Đang vận chuyển.");
            setIsTransferModalVisible(false);
            transferForm.resetFields();
            fetchBatchDetail();
            fetchBox();
        } catch (error: any) {
            message.error("Có lỗi xảy ra khi xuất lô thuốc! (Vui lòng kiểm tra log Backend)");
        } finally {
            setTransferring(false);
        }
    };

    useEffect(() => {
        const canTransfer = batchDetail?.status === "PRODUCED" || batchDetail?.status === "STORED";

        setHeaderActions(
            <Flex gap="small" align="center">
                <Button 
                    type="default" 
                    size="large" 
                    icon={<HistoryOutlined />} 
                    onClick={() => setIsHistoryVisible(true)}
                >
                    Lịch sử vận chuyển
                </Button>
                
                <Button 
                    type="primary" 
                    size="large" 
                    onClick={() => setIsTransferModalVisible(true)}
                    loading={transferring}
                    disabled={!canTransfer}
                >
                    {canTransfer ? "Xuất lô thuốc" : "Không thể xuất"}
                </Button>
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, transferring, batchDetail?.status]);

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
                <Link to={`/manufacturer/warehouse/batch/${id}/${record.boxId}`} style={{ color: '#1890ff' }}>Xem chi tiết</Link>
            )
        }
    ];

    if (!batchDetail) {
        return <Flex justify="center" align="center" style={{ height: '80vh' }}><Spin size="large" /></Flex>;
    }

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Flex vertical align="center" gap={16}>
                <SupplyChainStep current={currentStep} isRecalled={batchDetail.status === "RECALLED"} />
                
                <Row gutter={24} style={{ width: "100%" }}>
                    <Col xs={24} lg={10}>
                        <Card title="Thông tin lô thuốc">
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
                                label="Trạng thái"
                                value={(<Tag color={batchStatusMap[batchDetail.status]?.color || "default"}>
                                    {batchStatusMap[batchDetail.status]?.label || batchDetail.status}
                                </Tag>) as any}
                            />
                            <InfoRow 
                                label="Sản phẩm" 
                                value={(<span><Text strong style={{ color: '#1677ff' }}>{drugName}</Text></span>) as any} 
                            />
                            <InfoRow 
                                label="Cơ sở sản xuất" 
                                value={(<span><Text strong>{facilityName}</Text></span>) as any} 
                            />
                            <InfoRow label="Số hộp" value={`${batchDetail.totalBoxes || boxes.length} hộp`} />
                            <InfoRow label="Ngày sản xuất" value={batchDetail.productionDate ? dayjs(batchDetail.productionDate).format("DD/MM/YYYY") : "N/A"} />
                            <InfoRow label="Hạn sử dụng" value={batchDetail.expiryDate ? dayjs(batchDetail.expiryDate).format("DD/MM/YYYY") : "N/A"} />
                        </Card>
                    </Col>

                    <Col xs={24} lg={14} style={{ marginTop: 16 }}>
                        <Card title={`Danh sách hộp thuốc (${boxes.length})`}>
                            <Table
                                columns={columns}
                                dataSource={boxes}
                                loading={loading}
                                pagination={{ pageSize: 2 }}
                                rowKey="boxId"
                                scroll={{ x: 500 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </Flex>

            <Modal
                title="Xác nhận xuất lô thuốc (Giao hàng)"
                open={isTransferModalVisible}
                onOk={() => transferForm.submit()} 
                onCancel={() => {
                    setIsTransferModalVisible(false);
                    transferForm.resetFields();
                }}
                confirmLoading={transferring}
                okText="Xác nhận xuất kho"
                cancelText="Hủy bỏ"
                okButtonProps={{ danger: true }}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>Bạn đang tiến hành xuất lô thuốc <b>{id}</b> ra khỏi kho để bàn giao vận chuyển.</p>
                    <p style={{ color: 'red' }}>Hành động này sẽ được ghi nhận lên Blockchain và không thể hoàn tác!</p>
                </div>
                
                <Form form={transferForm} layout="vertical" onFinish={handleTransferSubmit}>
                    <Form.Item name="toOrgId" label="Tổ chức nhận" rules={[{ required: true, message: 'Vui lòng chọn tổ chức nhận!' }]}>
                        <Select
                            showSearch
                            placeholder="Chọn tổ chức đối tác..."
                            loading={loadingOrgs}
                            onChange={handleOrgChange}
                            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                            options={orgList.map(org => ({ label: org.orgName || org.id || org.orgId, value: org.id || org.orgId }))}
                        />
                    </Form.Item>

                    <Form.Item name="toFacilityId" label="Cơ sở nhận (Kho đích)" rules={[{ required: true, message: 'Vui lòng chọn cơ sở nhận!' }]}>
                        <Select
                            showSearch
                            placeholder={transferForm.getFieldValue('toOrgId') ? "Chọn cơ sở / kho đích..." : "Vui lòng chọn tổ chức trước"}
                            loading={loadingFacilities}
                            disabled={!transferForm.getFieldValue('toOrgId') || facilityList.length === 0}
                            filterOption={(input, option) => (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())}
                            options={facilityList.map(fac => ({ label: fac.facilityName || fac.id || fac.facilityId, value: fac.id || fac.facilityId }))}
                        />
                    </Form.Item>

                    <Form.Item name="note" label="Ghi chú vận chuyển">
                        <Input.TextArea placeholder="Nhập biển số xe, thông tin tài xế, nhiệt độ bảo quản yêu cầu..." rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

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
        </Layout.Content>
    );
}