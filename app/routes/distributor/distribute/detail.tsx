import { Card, Layout, Row, Col, Table, Tag, Button, Flex, Descriptions } from "antd";
import { InfoRow } from "components/InfoRow/InfoRow";
import SupplyChainStep from "components/SupplyChainStep/SupplyChainStep";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";
import { useLocation, useParams } from "react-router";

export default function BatchDetail() {
    const location = useLocation();
    const batch = location.state;

    const { setHeaderActions } = useHeaderActions();
    
    useEffect(() => {
        setHeaderActions(
            <Button type="primary" size="large">
                Xuất lô thuốc
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
            <Flex vertical align="center" gap={16}>
                <SupplyChainStep/>
                <Row gutter={24} style={{ width: "100%" }}>
                    <Col span={10}>
                        <Card title="Thông tin lô thuốc">
                            <InfoRow label="Trạng thái" value={batch?.status} />
                            <InfoRow label="Tên thuốc" value={batch?.medicineName} />
                            <InfoRow label="Đơn vị quản lý" value="ABCLogistics" />
                            <InfoRow label="Số hộp" value="100" />
                            <InfoRow label="Ngày sản xuất" value="01/11/2025" />
                            <InfoRow label="Ngày kiểm duyệt" value="03/11/2025" />
                            <InfoRow label="Ngày xuất hàng" value="04/11/2025" />
                            <InfoRow label="Hạn sử dụng" value="01/11/2027" />
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
            </Flex>
        </Layout.Content>
    );
}