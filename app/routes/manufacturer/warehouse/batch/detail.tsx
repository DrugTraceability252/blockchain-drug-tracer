import { Card, Layout, Row, Col, Table, Tag, Button, Flex, message, Modal, Spin } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { InfoRow } from "components/InfoRow/InfoRow";
import SupplyChainStep from "components/SupplyChainStep/SupplyChainStep";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router";
import dayjs from "dayjs";
import { useAuth } from "auth/useAuth";

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

    const fetchBatchDetail = useCallback(async () => {
        try {
            const result = await drugBatchApi.getById(id || "");
            setBatchDetail(result.data || result);
        } catch (error) {
            console.error("Lỗi lấy chi tiết lô:", error);
            message.error("Không thể tải thông tin chi tiết lô thuốc!");
        }
    }, [id]);

   const fetchBox = useCallback(async () => {
        setLoading(true);
        try {
            const result = await drugBatchApi.getBoxByBatchId({
                page: 1,
                size: 100,
                batchId: id || ""
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

    const handleTransferBatch = async () => {
        if (!user?.facilityId) {
            message.error("Không tìm thấy mã cơ sở của bạn để xuất kho!");
            return;
        }

        setTransferring(true);
        try {
            await drugBatchApi.transferOwnership(id!, user.facilityId);
            message.success("Xuất lô thuốc thành công! Trạng thái đã chuyển sang Vận chuyển.");
            
            fetchBatchDetail();
            fetchBox();
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi xuất lô thuốc!");
        } finally {
            setTransferring(false);
        }
    };

    const showTransferConfirm = useCallback(() => {
        Modal.confirm({
            title: 'Xác nhận xuất lô thuốc',
            content: 'Bạn có chắc chắn muốn xuất lô thuốc này khỏi cơ sở hiện tại để bàn giao cho đơn vị vận chuyển không?',
            okText: 'Xác nhận xuất',
            cancelText: 'Hủy bỏ',
            onOk: handleTransferBatch,
        });
    }, [handleTransferBatch]);

    useEffect(() => {
        const canTransfer = batchDetail?.status === "PRODUCED" || batchDetail?.status === "STORED";

        setHeaderActions(
            <Button 
                type="primary" 
                size="large" 
                onClick={showTransferConfirm}
                loading={transferring}
                disabled={!canTransfer}
            >
                {canTransfer ? "Xuất lô thuốc" : "Không thể xuất"}
            </Button>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, showTransferConfirm, transferring, batchDetail?.status]);

    const columns = [
        { 
            title: "Mã hộp", 
            dataIndex: "boxId",
            key: "boxId",
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
                <Link to={`/manufacturer/warehouse/batch/${id}/${record.boxId}`} style={{ color: '#1890ff' }}>
                    Xem chi tiết
                </Link>
            )
        }
    ];

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

    if (!batchDetail) {
        return <Flex justify="center" align="center" style={{ height: '80vh' }}><Spin size="large" /></Flex>;
    }

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Flex vertical align="center" gap={16}>
                <SupplyChainStep current={currentStep} isRecalled={batchDetail.status === "RECALLED"} />
                
                <Row gutter={24} style={{ width: "100%" }}>
                    <Col span={10}>
                        <Card title="Thông tin lô thuốc">
                            <InfoRow label="Mã lô" value={batchDetail.batchId} />
                            
                            <InfoRow
                                label="Trạng thái"
                                value={(<Tag color={batchStatusMap[batchDetail.status]?.color || "default"}>
                                    {batchStatusMap[batchDetail.status]?.label || batchDetail.status}
                                </Tag>) as any}
                            />
                            
                            <InfoRow label="Mã thuốc" value={batchDetail.drugId} />
                            <InfoRow label="Cơ sở sản xuất" value={batchDetail.manufacturerFacilityId} />
                            
                            <InfoRow label="Số hộp" value={`${batchDetail.totalBoxes || boxes.length} hộp`} />
                            
                            <InfoRow label="Ngày sản xuất" value={batchDetail.productionDate ? dayjs(batchDetail.productionDate).format("DD/MM/YYYY") : "N/A"} />
                            <InfoRow label="Hạn sử dụng" value={batchDetail.expiryDate ? dayjs(batchDetail.expiryDate).format("DD/MM/YYYY") : "N/A"} />
                        </Card>
                    </Col>

                    <Col span={14}>
                        <Card title={`Danh sách hộp thuốc (${boxes.length})`}>
                            <Table
                                columns={columns}
                                dataSource={boxes}
                                loading={loading}
                                pagination={{ pageSize: 4 }}
                                rowKey="boxId"
                            />
                        </Card>
                    </Col>
                </Row>
            </Flex>
        </Layout.Content>
    );
}