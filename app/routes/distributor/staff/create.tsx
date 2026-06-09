import { Button, Form, Input, Layout, Row, Col, Select, message, Upload, Divider } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { authApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const { Dragger } = Upload;

export default function DistributorWarehouseCreateStaff() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [fileList, setFileList] = useState<any[]>([]);

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
        if (!user?.orgId) {
            message.error("Không tìm thấy thông tin tổ chức của bạn!");
            return;
        }

        try {
            setLoading(true);
            
            const facilityId = user.facilityId || "DEFAULT_FAC"; 
            const groupString = `${user.role}/${user.orgId}/${facilityId}/${values.role}`;

            const userPayload = {
                username: values.username,
                password: values.password, 
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone,
                identityNumber: values.identityNumber,
                group: groupString, 
                avatarUrl: "string",
            };

            const formData = new FormData();
            formData.append("request", JSON.stringify(userPayload));

            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append("files", file.originFileObj);
                }
            });

            await authApi.register(formData); 
            
            message.success("Tạo tài khoản nhân viên thành công!");
            navigate("/distributor/staff"); 
            
        } catch (error: any) {
            console.error(error);
            message.error("Có lỗi xảy ra: " + (error.message || "Vui lòng thử lại"));
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
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Họ (Last Name)"
                            name="lastName"
                            rules={[{ required: true, message: "Vui lòng nhập họ" }]}
                        >
                            <Input placeholder="VD: Nguyễn Văn" size="large" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Tên (First Name)"
                            name="firstName"
                            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                        >
                            <Input placeholder="VD: A" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Tên đăng nhập (Username)"
                            name="username"
                            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
                        >
                            <Input placeholder="VD: nguyenvana123" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Mật khẩu khởi tạo"
                            name="password"
                            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu cho nhân viên" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: 'email', message: "Email không đúng định dạng" }
                            ]}
                        >
                            <Input placeholder="VD: email@domain.com" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input placeholder="Nhập số điện thoại liên hệ" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Số CCCD / CMND"
                            name="identityNumber"
                            rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}
                        >
                            <Input placeholder="Nhập số CCCD" size="large" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="Phân quyền (Vai trò)"
                            name="role"
                            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                        >
                            <Select size="large" placeholder="Chọn vai trò cho nhân viên">
                                <Select.Option value="MEMBER">Nhân viên</Select.Option>
                                <Select.Option value="ADMIN">Quản lý</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider dashed />

                <Row>
                    <Col span={24}>
                        <Form.Item label="Hồ sơ minh chứng (CCCD, Hợp đồng lao động, Bằng cấp...)">
                            <Dragger 
                                multiple={true} 
                                beforeUpload={() => false}
                                fileList={fileList}
                                onChange={(info) => setFileList(info.fileList)}
                                accept=".pdf,.png,.jpg,.jpeg"
                            >
                                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                                <p className="ant-upload-text">Kéo thả hoặc nhấp để tải file PDF/Ảnh lên</p>
                            </Dragger>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Layout.Content>
    );
}