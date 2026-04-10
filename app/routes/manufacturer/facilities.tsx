import { Card, Row, Col, Typography, Button, Flex, Input, Modal, Form, Upload, message, Spin, Select } from "antd";
import { PictureOutlined, PlusOutlined, SearchOutlined, InboxOutlined } from "@ant-design/icons";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { facilityApi } from "api/facilityApi";
import { useAuth } from "auth/useAuth";

const { Dragger } = Upload;
const { Text, Title } = Typography;

export default function FacilityList() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();
    const [form] = Form.useForm();
    
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    
    // 🌟 Lấy danh sách dùng orgId thực tế
    const fetchFacilities = useCallback(async () => {
        if (!user?.orgId) return;

        setLoading(true);
        try {
            const result = await facilityApi.getByOrgId(user.orgId, { page: 1, size: 100 });
            setFacilities(result.data || result.content || []); // Tùy cấu trúc PageResponse của BE
        } catch (error) {
            console.error("Lỗi lấy danh sách cơ sở:", error);
            message.error("Không thể tải danh sách cơ sở!");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId]);

    // Gọi API khi vừa vào trang
    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

    // Cấu hình Header Action
    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={() => {
                        form.resetFields(); 
                        setOpen(true);
                    }}
                >
                    Thêm cơ sở
                </Button>
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, form]);

    // 🌟 Hàm xử lý submit Form tạo mới
    const handleCreate = async (values: any) => {
        if (!user?.orgId) {
            message.error("Không xác định được tổ chức của bạn!");
            return;
        }

        setSubmitting(true);
        try {
            // 🌟 Payload bám sát 100% RegisterFacilityRequest.java
            const payload = {
                facilityName: values.facilityName,
                facilityType: values.facilityType, 
                licenseNumber: values.licenseNumber,
                address: values.address,
                contactPhone: values.contactPhone,
            };

            await facilityApi.create(user.orgId, payload);
            message.success("Tạo cơ sở thành công!");
            
            setOpen(false);
            fetchFacilities(); // Refresh lại danh sách sau khi tạo

        } catch (error: any) {
            console.error("Lỗi tạo cơ sở:", error);
            message.error("Có lỗi xảy ra: " + (error.message || "Vui lòng thử lại"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ padding: 12}}>
            <Flex flex={1} style={{ width: '50%', paddingBottom: 24 }}>
                <Input
                    placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
                    size="large"
                    suffix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ borderRadius: 8 }}
                />
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" style={{ height: 300 }}>
                    <Spin size="large" />
                </Flex>
            ) : (
                <Row gutter={[24, 24]}>
                    {facilities.map((item) => (
                        <Col span={8} key={item.facilityId}>
                            <Card
                                hoverable
                                style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                            >
                                <div
                                    style={{
                                        height: 200,
                                        backgroundColor: '#fafafa',
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderBottom: "1px solid #f0f0f0",
                                    }}
                                >
                                    <PictureOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                                </div>

                                <div style={{ padding: '20px' }}>
                                    <Title level={5} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                                        {item.facilityName || 'Tên cơ sở chưa cập nhật'}
                                    </Title>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                        <strong>Loại:</strong> {item.facilityType}
                                    </Text>
                                    <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                        <strong>SĐT:</strong> {item.contactPhone || 'N/A'}
                                    </Text>
                                    <div style={{ wordBreak: "break-word", lineHeight: 1.5, marginTop: 8 }}>
                                        <Text style={{ color: "#555" }}>
                                            {item.address}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))}
                    {facilities.length === 0 && (
                        <Col span={24}>
                            <Flex justify="center" style={{ padding: 40 }}>
                                <Text type="secondary">Chưa có cơ sở nào. Hãy thêm mới!</Text>
                            </Flex>
                        </Col>
                    )}
                </Row>
            )}

            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Thêm cơ sở mới</Title>}
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                width={700}
                centered
            >
                <Form layout="vertical" form={form} onFinish={handleCreate} style={{ marginTop: 16 }}>
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                label="Tên cơ sở"
                                name="facilityName"
                                rules={[{ required: true, message: "Vui lòng nhập tên cơ sở" }]}
                            >
                                <Input size="large" placeholder="VD: Nhà máy dược phẩm STADA" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Loại cơ sở"
                                name="facilityType"
                                rules={[{ required: true, message: "Chọn loại" }]}
                            >
                                {/* 🌟 Cập nhật Enum chuẩn từ Backend */}
                                <Select size="large" options={[
                                    { value: "FACTORY", label: "Nhà máy (FACTORY)" },
                                    { value: "WAREHOUSE", label: "Kho hàng (WAREHOUSE)" },
                                    { value: "STORE", label: "Cửa hàng/Nhà thuốc (STORE)" } 
                                ]} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Số điện thoại"
                                name="contactPhone"
                                rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
                            >
                                <Input size="large" placeholder="VD: 02838962222" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Số giấy phép (GCN)"
                                name="licenseNumber"
                                rules={[{ required: true, message: "Vui lòng nhập số giấy phép" }]}
                            >
                                <Input size="large" placeholder="VD: GCN-GMP-2025-089" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Địa chỉ chi tiết"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input.TextArea rows={3} size="large" placeholder="VD: Số 40 Đại lộ Tự Do..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item label="Hình ảnh minh họa">
                                <Dragger name="file" multiple={false} beforeUpload={() => false} style={{ padding: "20px 0" }}>
                                    <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                    <p className="ant-upload-text" style={{ fontSize: 14, marginTop: 8 }}>Tải ảnh lên</p>
                                </Dragger>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Hồ sơ chứng nhận">
                                <Dragger name="file" multiple={false} beforeUpload={() => false} style={{ padding: "20px 0" }}>
                                    <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                    <p className="ant-upload-text" style={{ fontSize: 14, marginTop: 8 }}>Tải tài liệu PDF</p>
                                </Dragger>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Flex justify="end" style={{ marginTop: 16 }}>
                        <Button onClick={() => setOpen(false)} style={{ marginRight: 12 }} size="large">
                            Hủy bỏ
                        </Button>
                        <Button type="primary" size="large" htmlType="submit" loading={submitting}>
                            Lưu cơ sở
                        </Button>
                    </Flex>
                </Form>
            </Modal>
        </div>
    );
}