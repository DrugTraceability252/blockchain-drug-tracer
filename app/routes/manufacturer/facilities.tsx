import { Card, Row, Col, Typography, Button, Flex, Input } from "antd";
import { PictureOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Modal, Form, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

const facilities = [
    {
        id: 1,
        address:
        "Địa chỉ: 268 Lý Thường Kiệt, phường Diên Hồng, thành phố Hồ Chí Minh.",
    },
    {
        id: 2,
        address:
        "Địa chỉ: 269 Lý Thường Kiệt, phường Diên Hồng, thành phố Hồ Chí Minh.",
    },
];

export default function FacilityList() {
    const { setHeaderActions } = useHeaderActions();
    const [open, setOpen] = useState(false);
    
    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => setOpen(true)}
                >
                    Thêm cơ sở
                </Button>
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    return (
        <div style={{ padding: 8}}>
            <Flex flex={1} style={{ width: '50%', paddingBottom: 12}}>
                <Input
                    placeholder="Tìm kiếm"
                    size="large"
                    suffix={<SearchOutlined />}
                />
            </Flex>
            <Row gutter={[16, 16]}>
            {facilities.map((item) => (
                <Col span={8} key={item.id}>
                    <Card
                        style={{ borderRadius: 8, padding: 0 }}
                    >
                        <div
                            style={{
                                height: 250,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderBottom: "1px solid #f0f0f0",
                            }}
                        >
                            <PictureOutlined style={{ fontSize: 128 }} />
                        </div>

                        <div
                            style={{
                                padding: 12,
                                wordBreak: "break-word",
                                lineHeight: 1.5,
                        }}
                        >
                            <Text style={{ fontSize: 20, color: "#555" }}>
                                {item.address}
                            </Text>
                        </div>
                    </Card>
                </Col>
            ))}
            </Row>
            <Modal
                title="Thêm cơ sở"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                width={700}
            >
                <Form layout="vertical">
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input size="large" />
                    </Form.Item>

                    <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Hình ảnh" name="image">
                        <Dragger
                            name="file"
                            multiple={false}
                            beforeUpload={() => false}
                            style={{ padding: "20px 0" }}
                        >
                            <InboxOutlined size={24}/>
                        </Dragger>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Hồ sơ" name="document">
                            <Dragger
                                name="file"
                                multiple={false}
                                beforeUpload={() => false}
                                style={{ padding: "20px 0" }}
                            >
                                <InboxOutlined size={24}/>
                            </Dragger>
                        </Form.Item>
                    </Col>
                    </Row>

                    <Flex justify="end">
                        <Button type="primary" size="large">
                            Gửi đăng ký
                        </Button>
                    </Flex>

                </Form>
            </Modal>
        </div>
    );
}