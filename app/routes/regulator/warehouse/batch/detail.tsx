import { Card, Layout, Row, Col, Tag, Button, Flex, message, Modal, Spin, Typography, Timeline } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi"; 
import { organizationApi } from "api/organizationApi"; 
import { InfoRow } from "components/InfoRow/InfoRow";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router";
import dayjs from "dayjs";
import { CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined } from "@ant-design/icons";

const { Text } = Typography;

const qcStatusMap: Record<string, { color: string; label: string }> = {
    PASSED: { color: "green", label: "Đạt chuẩn" },
    FAILED: { color: "red", label: "Không đạt" },
    PENDING: { color: "orange", label: "Chờ kiểm định" }
};

export default function RegulatorBatchDetail() {
    const { id } = useParams();
    const { setHeaderActions } = useHeaderActions();
    
    const [batchDetail, setBatchDetail] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [drugName, setDrugName] = useState<string>("Đang tải...");
    const [orgName, setOrgName] = useState<string>("Đang tải...");
    const [facilityName, setFacilityName] = useState<string>("Đang tải...");

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

    useEffect(() => {
        if (id) fetchBatchDetail();
    }, [id, fetchBatchDetail]);

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

    useEffect(() => {
        if (!batchDetail) return;

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

                {batchDetail.qcStatus === "PENDING" && (
                    <>
                        <Button 
                            danger 
                            size="large" 
                            icon={<CloseCircleOutlined />} 
                            loading={actionLoading}
                            onClick={() => handleUpdateQC("FAILED")}
                        >
                            Không đạt
                        </Button>
                        <Button 
                            type="primary" 
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            size="large" 
                            icon={<CheckCircleOutlined />} 
                            loading={actionLoading}
                            onClick={() => handleUpdateQC("PASSED")}
                        >
                            Đạt chuẩn
                        </Button>
                    </>
                )}
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions, batchDetail, actionLoading]); 

    if (!batchDetail) return <Flex justify="center" align="center" style={{ height: '80vh' }}><Spin size="large" /></Flex>;

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Flex vertical align="center" gap={16}>
                <Row gutter={24} style={{ width: "100%", justifyContent: "center" }}>
                    <Col span={16}>
                        <Card title="Hồ sơ kiểm định lô thuốc (QC)">
                            <InfoRow label="Mã lô" value={<b>{batchDetail.batchId}</b> as any} />
                            <InfoRow label="Sản phẩm" value={<span style={{ fontWeight: 500, color: '#1677ff' }}>{drugName}</span> as any} />
                            <InfoRow label="Tổ chức sản xuất" value={orgName} />
                            <InfoRow label="Cơ sở sản xuất" value={facilityName} />
                            <InfoRow label="Số lượng" value={`${batchDetail.totalBoxes} ${batchDetail.unit || "Hộp"}`} />
                            <InfoRow label="Ngày sản xuất" value={dayjs(batchDetail.productionDate).format("DD/MM/YYYY")} />
                            <InfoRow label="Hạn sử dụng" value={dayjs(batchDetail.expiryDate).format("DD/MM/YYYY")} />
                            
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
                </Row>
            </Flex>

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
                                                value={<Tag color="blue" style={{ margin: 0 }}>{qcStatusMap[item.data.status]?.label || item.data.status}</Tag> as any} 
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