import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Layout, Row, Col, Select, Upload } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";

const { TextArea } = Input;

export default function ManufacturerWarehouseCreateProfile() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();

    useEffect(() => {
        setHeaderActions(
            <Button type="primary" size="large" onClick={() => form.submit()}>
                Lưu thông tin
            </Button>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions, form]);

    const onFinish = (values: any) => {
        console.log(values);
    };

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{padding: 12}}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item
                            label="Tên thuốc"
                            name="medicineName"
                            rules={[{ required: true, message: "Nhập tên thuốc" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Nhóm thuốc"
                            name="group"
                            rules={[{ required: true, message: "Chọn nhóm thuốc" }]}
                        >
                            <Select
                                placeholder="Chọn nhóm thuốc"
                                options={[
                                    { value: "groupA", label: "Nhóm A" },
                                    { value: "groupB", label: "Nhóm B" },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Hướng dẫn sử dụng"
                            name="usageDirection"
                            rules={[{ required: true, message: "Nhập hướng dẫn sử dụng" }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Tác dụng phụ"
                            name="sideEffects"
                            rules={[{ required: true, message: "Nhập tác dụng phụ" }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Hồ sơ minh chứng"
                            name="sideEffects"
                            rules={[{ required: true, message: "Nhập tác dụng phụ" }]}
                        >
                            <Upload>
                                <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Layout.Content>
    );
}