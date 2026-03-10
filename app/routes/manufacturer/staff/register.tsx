import { Row, Col, Card, Button, Divider, Flex } from "antd";
import { PaperClipOutlined } from "@ant-design/icons";
import { InfoRow } from "components/InfoRow/InfoRow";

const data = [
    {
        id: 1,
        name: "Nguyễn Văn Minh",
        role: "Nhân viên kho bãi",
        department: "H1-101",
        dob: "01/01/2000",
        cccd: "0123456789",
        file: "hosominhchung.pdf",
    },
    {
        id: 2,
        name: "Nguyễn Văn Ninh",
        role: "Nhân viên kho bãi",
        department: "H1-102",
        dob: "01/01/2000",
        cccd: "0123456780",
        file: "hosominhchung.pdf",
    },
];

export default function RegisterList() {
    return (
        <div style={{ padding: 8 }}>
            <Row gutter={[16, 16]}>
                {data.map((item) => (
                <Col span={12} key={item.id}>
                    <Card style={{ padding: 12 }}>
                        <InfoRow label="Họ và tên" value={item.name} />
                        <InfoRow label="Chức vụ" value={item.role} />
                        <InfoRow label="Phòng ban" value={item.department} />
                        <InfoRow label="Ngày tháng năm sinh" value={item.dob} />
                        <InfoRow label="Số CCCD" value={item.cccd} />

                        <div
                            style={{
                            marginTop: 12,
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            padding: "8px 10px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#1677ff",
                            }}
                        >
                            <PaperClipOutlined />
                            {item.file}
                        </div>

                        <Divider style={{margin: '12px 0px'}}/>

                        <Flex justify="space-between" style={{}}>
                            <Button danger>Xóa</Button>
                            <Button type="primary">Chấp nhận</Button>
                        </Flex>
                    </Card>
                </Col>
                ))}
            </Row>
        </div>
    );
}