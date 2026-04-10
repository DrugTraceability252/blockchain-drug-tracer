import { Card, Col, Flex, Layout, message, Row, Spin, Tag } from "antd";
import { InfoRow } from "components/InfoRow/InfoRow";
import SupplyChainStep from "components/SupplyChainStep/SupplyChainStep";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

type BoxDetailData = {
    docType: string;
    boxId: string;
    batchId: string;
    manufacturerFacilityId: string;
    manufacturerOrgId: string;
    currentFacilityId: string;
    currentOrgId: string;
    status: string;
    expiryDate: string;
    createdAt: string;
    lastUpdatedAt: string;
};

const statusMap: Record<string, { color: string; label: string }> = {
    PRODUCED: { color: "gold", label: "Đã sản xuất" },
    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
    IN_PHARMACY: { color: "cyan", label: "Tại nhà thuốc" },
    SOLD: { color: "red", label: "Đã bán" },
    RECALLED: { color: "volcano", label: "Thu hồi" },
};

export default function BoxDetail() {
    const { boxid } = useParams<{ boxid: string }>();
    const [loading, setLoading] = useState(true);
    const [boxDetail, setBoxDetail] = useState<BoxDetailData | null>(null);

    useEffect(() => {
        const fetchBoxDetail = async () => {
            if (!boxid) return;
            setLoading(true);
            try {
                // NOTE: In a real application, you would fetch this data from an API
                // const result = await boxApi.getById(boxId);
                
                // For demonstration, we'll use mock data.
                const mockResult: BoxDetailData = {
                    docType: "box",
                    boxId: boxid,
                    batchId: "BATCH_HAPA_260301",
                    manufacturerFacilityId: "FAC_HCM_001",
                    manufacturerOrgId: "ORG001",
                    currentFacilityId: "FAC_HCM_001",
                    currentOrgId: "ORG001",
                    status: "PRODUCED",
                    expiryDate: "2029-03-15T23:59:59Z",
                    createdAt: "2026-03-27T10:02:24.289Z",
                    lastUpdatedAt: "2026-03-27T10:02:24.289Z"
                };
                setBoxDetail(mockResult);
            } catch (error) {
                console.error("Fetch error:", error);
                message.error("Có lỗi xảy ra khi tải chi tiết hộp thuốc!");
            } finally {
                setLoading(false);
            }
        };

        fetchBoxDetail();
    }, [boxid]);

    const renderStatus = (status: string) => {
        const config = statusMap[status] || { color: "default", label: status || "Không rõ" };
        return <Tag color={config.color}>{config.label}</Tag>;
    };

    if (loading) {
        return <Flex justify="center" align="center" style={{ height: '100vh' }}><Spin size="large" /></Flex>;
    }

    if (!boxDetail) {
        return <div style={{ padding: 24 }}>Không tìm thấy chi tiết hộp thuốc.</div>;
    }

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Flex vertical align="center" gap={16}>
                {/* <SupplyChainStep currentStatus={boxDetail.status} /> */}
                <Row gutter={24} style={{ width: "100%" }}>
                    <Col span={24}>
                        <Card title={`Chi tiết hộp thuốc - ${boxDetail.boxId}`}>
                            <InfoRow label="Mã hộp" value={boxDetail.boxId} />
                            <InfoRow label="Mã lô" value={boxDetail.batchId} />
                            {/* <InfoRow label="Trạng thái" value={renderStatus(boxDetail.status)} /> */}
                            <InfoRow label="Hạn sử dụng" value={dayjs(boxDetail.expiryDate).format("DD/MM/YYYY")} />
                            <InfoRow label="Cơ sở sản xuất" value={boxDetail.manufacturerFacilityId} />
                            <InfoRow label="Tổ chức sản xuất" value={boxDetail.manufacturerOrgId} />
                            <InfoRow label="Cơ sở hiện tại" value={boxDetail.currentFacilityId} />
                            <InfoRow label="Tổ chức hiện tại" value={boxDetail.currentOrgId} />
                            <InfoRow label="Ngày tạo" value={dayjs(boxDetail.createdAt).format("DD/MM/YYYY HH:mm:ss")} />
                            <InfoRow label="Cập nhật lần cuối" value={dayjs(boxDetail.lastUpdatedAt).format("DD/MM/YYYY HH:mm:ss")} />
                        </Card>
                    </Col>
                </Row>
            </Flex>
        </Layout.Content>
    );
}
