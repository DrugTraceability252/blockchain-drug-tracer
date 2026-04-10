import { Card, Layout, Row, Col, Table, Tag, Button, Flex, message, Modal, Spin } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { InfoRow } from "components/InfoRow/InfoRow";
import SupplyChainStep from "components/SupplyChainStep/SupplyChainStep";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router";
import dayjs from "dayjs";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

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
        if (!batchDetail || batchDetail.qcStatus !== "PENDING") {
            setHeaderActions(null);
            return;
        }

        setHeaderActions(
            <Flex gap="small">
                <Button 
                    danger 
                    size="large" 
                    icon={<CloseCircleOutlined />} 
                    loading={actionLoading}
                    onClick={() => handleUpdateQC("FAILED")}
                >
                    Không đạt (FAIL)
                </Button>
                <Button 
                    type="primary" 
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    size="large" 
                    icon={<CheckCircleOutlined />} 
                    loading={actionLoading}
                    onClick={() => handleUpdateQC("PASSED")}
                >
                    Đạt chuẩn (PASS)
                </Button>
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
                            <InfoRow label="Mã thuốc" value={batchDetail.drugId} />
                            <InfoRow label="Tổ chức sản xuất" value={batchDetail.manufacturerOrgId} />
                            <InfoRow label="Cơ sở sản xuất" value={batchDetail.manufacturerFacilityId} />
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
        </Layout.Content>
    );
}