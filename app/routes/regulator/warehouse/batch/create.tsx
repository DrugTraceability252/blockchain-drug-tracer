import { Button, Form, Input, InputNumber, Layout, Row, Col, Select } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";

export default function ManufacturerWarehouseCreateBatch() {
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
                            label="ID thuốc"
                            name="medicineId"
                            rules={[{ required: true, message: "Nhập ID thuốc" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

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
                            label="Số lượng"
                            name="quantity"
                            rules={[{ required: true, message: "Nhập số lượng" }]}
                        >
                            <InputNumber style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Điểm đến"
                            name="destination"
                            rules={[{ required: true, message: "Chọn điểm đến" }]}
                        >
                            <Select
                                placeholder="Chọn điểm đến"
                                options={[
                                    { value: "warehouseA", label: "Kho A" },
                                    { value: "warehouseB", label: "Kho B" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Layout.Content>
    );
}