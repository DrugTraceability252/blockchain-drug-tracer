import { InboxOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Form, Input, Layout, Row, Select, Upload, message } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { organizationApi } from "api/organizationApi";

const { Dragger } = Upload;

export default function RegulatorCompanyCreate() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setHeaderActions(
            <Button 
                type="primary" 
                size="large" 
                onClick={() => form.submit()}
                loading={loading}
            >
                Lưu thông tin
            </Button>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, form, loading]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                orgName: values.orgName,
                orgType: values.orgType,
                taxCode: values.taxCode,
                licenseNumber: values.licenseNumber,
                address: values.address,
                contactEmail: values.contactEmail,
                contactPhone: values.contactPhone,
                documentHashes: ["hash_dummy_1"] // Tạm mock hash, sau này sẽ lấy từ kết quả upload MinIO
            };

            await organizationApi.create(payload);
            message.success("Đăng ký tổ chức thành công!");
            navigate("/regulator/companies"); // Quay về trang danh sách
        } catch (error: any) {
            console.error(error);
            message.error("Có lỗi xảy ra khi tạo tổ chức!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ padding: 24, background: '#fff', borderRadius: 8 }}
            >
                <Row gutter={24}>
                    <Col span={16}>
                        <Form.Item
                            label="Tên tổ chức / Công ty"
                            name="orgName"
                            rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
                        >
                            <Input size="large" placeholder="VD: Công ty TNHH Dược phẩm ABC" />
                        </Form.Item>
                    </Col>
                    
                    <Col span={8}>
                        <Form.Item
                            label="Loại hình"
                            name="orgType"
                            rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}
                        >
                            <Select size="large" placeholder="-- Chọn loại hình --">
                                <Select.Option value="MANUFACTURER">Nhà sản xuất</Select.Option>
                                <Select.Option value="DISTRIBUTOR">Nhà phân phối</Select.Option>
                                <Select.Option value="PHARMACY">Nhà thuốc / Bán lẻ</Select.Option>
                                <Select.Option value="HOSPITAL">Bệnh viện</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Mã số thuế"
                            name="taxCode"
                            rules={[{ required: true, message: "Vui lòng nhập mã số thuế" }]}
                        >
                            <Input size="large" placeholder="VD: 0100108756" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Số giấy phép (GCN)"
                            name="licenseNumber"
                            rules={[{ required: true, message: "Vui lòng nhập số giấy phép" }]}
                        >
                            <Input size="large" placeholder="VD: GCN-GDP-2025-089" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Email liên hệ"
                            name="contactEmail"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: 'email', message: "Email không đúng định dạng" }
                            ]}
                        >
                            <Input size="large" placeholder="VD: contact@company.com" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label="Số điện thoại"
                            name="contactPhone"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input size="large" placeholder="VD: 02439364455" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Địa chỉ trụ sở"
                            name="address"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                        >
                            <Input.TextArea rows={3} size="large" placeholder="Nhập địa chỉ chi tiết..." />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Hồ sơ minh chứng (Giấy phép kinh doanh, GPP, GSP, GMP...)">
                            <Dragger multiple={true} beforeUpload={() => false}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Kéo thả hoặc nhấp để tải file PDF/Ảnh lên</p>
                            </Dragger>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Layout.Content>
    );
}