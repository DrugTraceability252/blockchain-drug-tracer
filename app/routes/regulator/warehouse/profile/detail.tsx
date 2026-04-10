import { Card, Col, Flex, Row, Table, Tag, Typography, Button, Spin, Modal, message } from "antd";
import { drugProfileApi } from "api/drugProfileApi";
import { drugBatchApi } from "api/drugBatchApi";
import BorderCard from "components/Card/BorderCard";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const qcStatusMap: Record<string, { color: string; label: string }> = {
    PASSED: { color: "green", label: "Đạt chuẩn" },
    FAILED: { color: "red", label: "Không đạt" },
    PENDING: { color: "orange", label: "Chờ kiểm định" }
};

export default function RegulatorDrugProfileDetail() {
    const { id } = useParams<{ id: string }>(); // Sử dụng id từ URL
    const { setHeaderActions } = useHeaderActions();

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [medicineDetail, setMedicineDetail] = useState<any>(null);
    const [relatedBatches, setRelatedBatches] = useState<any[]>([]);

    // 🌟 Lấy chi tiết hồ sơ thuốc
    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            const data = await drugProfileApi.getById(id);
            setMedicineDetail(data.data || data);
        } catch (error) {
            console.error("Lỗi lấy chi tiết thuốc:", error);
            message.error("Không thể tải thông tin hồ sơ thuốc!");
        }
    }, [id]);

    // 🌟 Lấy danh sách lô thuốc liên quan
    const fetchRelatedBatches = useCallback(async () => {
        if (!id) return;
        try {
            const res = await drugBatchApi.getAll({ page: 1, size: 100 });
            const allBatches = res.data || res.content || [];
            setRelatedBatches(allBatches.filter((b: any) => b.drugId === id));
        } catch (error) {
            console.error("Lỗi tải lô thuốc liên quan", error);
        }
    }, [id]);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchDetail(), fetchRelatedBatches()]).finally(() => setLoading(false));
    }, [fetchDetail, fetchRelatedBatches]);

    // 🌟 Hàm xử lý Duyệt / Từ chối Hồ sơ
    const handleUpdateStatus = useCallback((status: string) => {
        Modal.confirm({
            title: status === "APPROVED" ? "Cấp phép hồ sơ thuốc này?" : "Từ chối hồ sơ thuốc này?",
            content: "Quyết định của bạn sẽ được ghi nhận vào Blockchain và không thể thay đổi.",
            okType: status === "REJECTED" ? "danger" : "primary",
            onOk: async () => {
                setActionLoading(true);
                try {
                    await drugProfileApi.updateStatus(id!, status);
                    message.success(`Đã ${status === "APPROVED" ? "Cấp phép" : "Từ chối"} hồ sơ thuốc!`);
                    fetchDetail(); // Tải lại chi tiết
                } catch (error) {
                    message.error("Có lỗi xảy ra khi cập nhật trạng thái!");
                } finally {
                    setActionLoading(false);
                }
            }
        });
    }, [id, fetchDetail]);

    // 🌟 Cấu hình Nút Action trên Header
    useEffect(() => {
        if (!medicineDetail || medicineDetail.status !== "PENDING") {
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
                    onClick={() => handleUpdateStatus("REJECTED")}
                >
                    Từ chối
                </Button>
                <Button 
                    type="primary" 
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    size="large" 
                    icon={<CheckCircleOutlined />} 
                    loading={actionLoading}
                    onClick={() => handleUpdateStatus("APPROVED")}
                >
                    Cấp phép
                </Button>
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, medicineDetail, actionLoading, handleUpdateStatus]);

    const batchColumns = [
        { title: 'Mã lô', dataIndex: 'batchId', key: 'batchId' },
        { title: 'Số lượng hộp', dataIndex: 'totalBoxes', key: 'totalBoxes' },
        { title: 'Ngày sản xuất', dataIndex: 'productionDate', key: 'productionDate', render: (d: string) => dayjs(d).format("DD/MM/YYYY") },
        { 
            title: 'Trạng thái QC', 
            dataIndex: 'qcStatus', 
            key: 'qcStatus',
            render: (status: string) => {
                const config = qcStatusMap[status] || { color: "default", label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (record: any) => (
                <Link to={`/regulator/batches/${record.batchId}`} style={{ color: '#1890ff' }}>
                    Xem chi tiết »
                </Link>
            ),
        },
    ];

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: '80vh' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </Flex>
        );
    }

    if (!medicineDetail) {
        return <div style={{ padding: 24 }}>Không tìm thấy hồ sơ thuốc này.</div>;
    }

    const currentStatus = medicineDetail.status;

    return (
        <div style={{ padding: '8px 24px', minHeight: '100vh' }}>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={14}>
                    <BorderCard title="Tổ chức Sản xuất (Manufacturer)">
                        <Flex justify="space-between" align="center" style={{ padding: 16 }}>
                            <Text strong style={{ fontSize: 16 }}>{medicineDetail.manufacturerOrgId}</Text>
                            <Link to={`/regulator/company/${medicineDetail.manufacturerOrgId}`}>
                                <Button type="link">Xem hồ sơ công ty »</Button>
                            </Link>
                        </Flex>
                    </BorderCard>
                </Col>
                <Col span={10}>
                    <BorderCard>
                        <Flex style={{ height: '100%' }}>
                            <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', textAlign: 'center', padding: '16px 0', backgroundColor: currentStatus === 'PENDING' ? '#e6f4ff' : 'transparent', color: currentStatus === 'PENDING' ? '#1890ff' : '#ccc', fontWeight: currentStatus === 'PENDING' ? 'bold' : 'normal' }}>
                                Chờ duyệt
                            </div>
                            <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', textAlign: 'center', padding: '16px 0', backgroundColor: currentStatus === 'APPROVED' ? '#0050b3' : 'transparent', color: currentStatus === 'APPROVED' ? '#fff' : '#ccc', fontWeight: currentStatus === 'APPROVED' ? 'bold' : 'normal' }}>
                                Đã duyệt
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: '16px 0', backgroundColor: currentStatus === 'REJECTED' ? '#fff2f0' : 'transparent', color: currentStatus === 'REJECTED' ? 'red' : '#ccc', fontWeight: currentStatus === 'REJECTED' ? 'bold' : 'normal' }}>
                                Từ chối
                            </div>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={14}>
                    <Flex vertical gap={16} style={{ height: '100%' }}>
                        <BorderCard title="Thông tin Chung">
                            <Row style={{ padding: 16 }}>
                                <Col span={8}>
                                    <Title level={4} style={{ margin: 0 }}>{medicineDetail.drugId}</Title>
                                    <Text type="secondary">Mã định danh (ID)</Text>
                                </Col>
                                <Col span={8}>
                                    <Title level={4} style={{ margin: 0 }}>{medicineDetail.drugName}</Title>
                                    <Text type="secondary">Tên thuốc</Text>
                                </Col>
                                <Col span={8}>
                                    <Title level={4} style={{ margin: 0, color: '#1677ff' }}>{relatedBatches.length} Lô</Title>
                                    <Text type="secondary">Đã lưu hành</Text>
                                </Col>
                            </Row>
                        </BorderCard>
                        
                        <BorderCard title="Tác dụng phụ / Cảnh báo" style={{ flex: 1 }}>
                            <Flex style={{ padding: 16 }}>
                                <Text>{medicineDetail.sideEffects || "Chưa có thông tin cảnh báo."}</Text>
                            </Flex>
                        </BorderCard>
                    </Flex>
                </Col>

                <Col span={10}>
                    <BorderCard title="Hướng dẫn sử dụng" style={{ height: '100%' }}>
                        <Flex style={{ padding: 16 }}>
                            <Text>{medicineDetail.usageInstructions || "Đang cập nhật..."}</Text>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <BorderCard title="Thành phần & Bào chế">
                        <Flex justify="space-between" style={{ padding: 16 }}>
                            <Text>Thành phần: <b>{medicineDetail.ingredients || "N/A"}</b></Text>
                            <Text>Dạng bào chế: <b>{medicineDetail.dosageForm || "N/A"}</b></Text>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <BorderCard title={`Các Lô thuốc đang lưu thông (${relatedBatches.length})`}>
                <Table
                    columns={batchColumns}
                    dataSource={relatedBatches}
                    pagination={{ pageSize: 5 }}
                    rowKey="batchId"
                />
            </BorderCard>
        </div>
    );
}