import { Card, Col, Flex, Row, Table, Tag, Typography, Button, Spin } from "antd";
import { drugProfileApi } from "api/drugProfileApi";
import BorderCard from "components/Card/BorderCard";
import BatchTable from "components/Table/BatchTable";
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router";

const { Title, Text } = Typography;

export default function MedicineDetail() {
    const { drugId } = useParams<{ drugId: string }>();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [medicineDetail, setMedicineDetail] = useState<any>(location.state || null);

    const batchData = [
        { key: '1', batchId: 'L7547U747289193', quantity: 200, date: '10/10/2025', status: 'PRODUCED' },
        { key: '2', batchId: 'L728UY34823899', quantity: 300, date: '15/09/2025', status: 'IN_TRANSIT' },
    ];

    const batchColumns = [
        { title: 'Mã lô', dataIndex: 'batchId', key: 'batchId' },
        { title: 'Số lượng hộp', dataIndex: 'quantity', key: 'quantity' },
        { title: 'Ngày tạo', dataIndex: 'date', key: 'date' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status: string) => {
                if (status === 'PRODUCED') return <Tag color="gold">Sản xuất</Tag>;
                if (status === 'IN_TRANSIT') return <Tag color="green">Vận chuyển</Tag>;
                return <Tag>{status}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: () => <Button type="link">Xem chi tiết »</Button>,
        },
    ];

    useEffect(() => {
        const fetchDetail = async () => {
            
            if (location.state && location.state.drugId === drugId) {
                setLoading(false);
                return;
            }

            if (!drugId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await drugProfileApi.getById(drugId);
                setMedicineDetail(data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết thuốc:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [drugId]);

    if (loading) {
        return (
            <Flex justify="center" align="center" style={{ height: '100vh' }}>
                <Spin size="large" />
            </Flex>
        );
    }

    if (!medicineDetail) {
        return <div style={{ padding: 24 }}>Không tìm thấy hồ sơ thuốc này.</div>;
    }

    return (
        <div style={{ padding: '8px', minHeight: '100vh' }}>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={14}>
                    <BorderCard title="Nhà sản xuất" >
                        <Flex justify="space-between" align="center" style={{ padding: 16 }}>
                            <Text>{medicineDetail.manufacturerOrgId}</Text>
                            <Button type="link">Xem chi tiết »</Button>
                        </Flex>
                    </BorderCard>
                </Col>
                <Col span={10}>
                    <BorderCard>
                        <Flex style={{ height: '100%' }}>
                            <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', textAlign: 'center', padding: '16px 0', color: medicineDetail.approveStatus === 'PENDING' ? '#1890ff' : '#000' }}>
                                Chờ duyệt
                            </div>
                            <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', textAlign: 'center', padding: '16px 0', backgroundColor: medicineDetail.approveStatus === 'APPROVED' ? '#0050b3' : 'transparent', color: medicineDetail.approveStatus === 'APPROVED' ? '#fff' : '#000' }}>
                                Đã duyệt
                            </div>
                            <div style={{ flex: 1, textAlign: 'center', padding: '16px 0', color: medicineDetail.approveStatus === 'REJECTED' ? 'red' : '#000' }}>
                                Từ chối
                            </div>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={14}>
                    <BorderCard title="Thông tin">
                        <Row style={{ padding: 16 }}>
                            <Col span={8}>
                                <Title level={4} style={{ margin: 0 }}>{medicineDetail.drugId}</Title>
                                <Text type="secondary">ID thuốc</Text>
                            </Col>
                            <Col span={8}>
                                <Title level={4} style={{ margin: 0 }}>{medicineDetail.drugType}</Title>
                                <Text type="secondary">Nhóm thuốc</Text>
                            </Col>
                            <Col span={8}>
                                <Title level={4} style={{ margin: 0 }}>7000 hộp</Title>
                                <Text type="secondary">Đã xuất kho</Text>
                            </Col>
                        </Row>
                    </BorderCard>
                    
                    <BorderCard title="Tác dụng phụ" style={{ marginTop: 16 }}>
                        <Flex style={{ padding: 16 }}>
                            <Text>{medicineDetail.sideEffects}</Text>
                        </Flex>
                    </BorderCard>
                </Col>

                <Col span={10}>
                    <BorderCard title="Hướng dẫn sử dụng" style={{ height: '100%' }}>
                        <Flex style={{ padding: 16 }}>
                            <Text>Sử dụng bằng đường: {medicineDetail.dosageForm}</Text>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={24}>
                     <BorderCard title="Thành phần">
                        <Flex justify="space-between" style={{ padding: 16 }}>
                            <Text>{medicineDetail.ingredient}</Text>
                            <Text strong>{medicineDetail.strength}</Text>
                        </Flex>
                    </BorderCard>
                </Col>
            </Row>

            <BorderCard title="Lô hàng">
                <BatchTable  
                    dataSource={batchData}
                    columns={batchColumns}
                />
            </BorderCard>
        </div>
    );
}