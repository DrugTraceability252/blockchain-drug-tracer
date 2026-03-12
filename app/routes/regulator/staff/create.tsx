import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Layout, Row, Col, Select, Upload, DatePicker, type DatePickerProps } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";

const { TextArea } = Input;

export default function ManufacturerWarehouseCreateStaff() {
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

    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        console.log(date, dateString);
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
                    <Col span={24}>
                        <Form.Item
                            label="Họ và tên"
                            name="name"
                            rules={[{ required: true, message: "Nhập họ và tên" }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Số CCCD"
                            name="CCCD"
                            rules={[{ required: true, message: "Nhập số CCCD" }]}
                        >
                            <Input/> 
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Ngày tháng năm sinh"
                            name="birthday"
                            rules={[{ required: true, message: "Nhập ngày tháng năm sinh" }]}
                        >
                            <DatePicker onChange={onChange} style={{ width: '100%', height: '100%'}}/>
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