import { Card, Layout, Row, Col, Table, Tag, Button, Flex, Descriptions } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router";

export default function BatchDetail() {
    const { id } = useParams();
    const location = useLocation();
    const batch = location.state;

    const { setHeaderActions } = useHeaderActions();
    
        useEffect(() => {
            setHeaderActions(
                <Button type="primary" size="large">
                    Lưu thông tin
                </Button>
            );
    
            return () => setHeaderActions(null);
        }, [setHeaderActions]);
        
    const columns = [
        { title: "Mã hộp", dataIndex: "boxId" },
        {
            title: "Trạng thái",
            render: () => <Tag color="green">Vận chuyển</Tag>
        },
        {
            title: "Hành động",
            render: () => "Xem chi tiết »"
        }
    ];

    const data = [
        { boxId: "H7547U7472" },
        { boxId: "H674767588" },
        { boxId: "H747389292" },
        { boxId: "H772849905" }
    ];

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <></>
            <div style={{padding: 12}}>
                <Row gutter={24}>
                    <Col span={10}>
                        <Card title="Thông tin lô thuốc">
                            <Descriptions column={1} bordered size="middle">
                                <Descriptions.Item label="Trạng thái">
                                    {batch?.status}
                                </Descriptions.Item>

                                <Descriptions.Item label="Tên thuốc">
                                    {batch?.medicineName}
                                </Descriptions.Item>

                                <Descriptions.Item label="Đơn vị quản lý">
                                    ABCLogistics
                                </Descriptions.Item>

                                <Descriptions.Item label="Số hộp">
                                    100
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày sản xuất">
                                    01/11/2025
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày kiểm duyệt">
                                    03/11/2025
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày xuất hàng">
                                    04/11/2025
                                </Descriptions.Item>

                                <Descriptions.Item label="Hạn sử dụng">
                                    01/11/2027
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col span={14}>
                        <Card title="Hộp thuốc">
                            <Table
                                columns={columns}
                                dataSource={data}
                                pagination={{ pageSize: 4 }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </Layout.Content>
    );
}