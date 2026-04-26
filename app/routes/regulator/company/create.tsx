import { InboxOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Form, Input, Layout, Row, Select, Upload, message, Divider, Typography } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { organizationApi } from "api/organizationApi";

const { Dragger } = Upload;
const { Title } = Typography;

export default function RegulatorCompanyCreate() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
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
        setLoading(true);
        try {
            const orgPayload = {
                orgName: values.orgName,
                orgType: values.orgType,
                taxCode: values.taxCode,
                licenseNumber: values.licenseNumber,
                address: values.address,
                contactEmail: values.contactEmail,
                contactPhone: values.contactPhone,
            };

            const formData = new FormData();
            formData.append("request", JSON.stringify(orgPayload));
            
            fileList.forEach(file => {
                if (file.originFileObj) {
                    formData.append("files", file.originFileObj);
                }
            });

            const orgResponse = await organizationApi.create(formData);
            const newOrgId = orgResponse.data?.orgId || orgResponse.orgId;

            if (!newOrgId) {
                throw new Error("Không lấy được ID tổ chức sau khi tạo!");
            }

            const facilityPayload = {
                facilityName: values.facilityName,
                facilityType: values.facilityType,
                licenseNumber: values.facilityLicenseNumber,
                address: values.facilityAddress,
                contactPhone: values.facilityContactPhone
            };

            const facilityFormData = new FormData();
            facilityFormData.append("request", JSON.stringify(facilityPayload));

            fileList.forEach(file => {
                if (file.originFileObj) {
                    facilityFormData.append("files", file.originFileObj);
                }
            });

            await organizationApi.createFacility(newOrgId, facilityFormData);

            message.success("Đăng ký tổ chức và cơ sở thành công!");
            
            if (orgPayload.orgType === "MANUFACTURER") {
                navigate("/regulator/manufacturer");
            } else if (orgPayload.orgType === "DISTRIBUTOR") {
                navigate("/regulator/distributor");
            } else if (orgPayload.orgType === "PHARMACY") {
                navigate("/regulator/pharmacy");
            } 
        } catch (error: any) {
            console.error(error);
            message.error("Có lỗi xảy ra khi tạo tổ chức hoặc cơ sở!");
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
                <Title level={4}>Thông tin pháp lý </Title>
                <Row gutter={24}>
                    <Col span={16}>
                        <Form.Item label="Tên tổ chức / Công ty" name="orgName" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: Công ty TNHH Dược phẩm ABC" />
                        </Form.Item>
                    </Col>
                    
                    <Col span={8}>
                        <Form.Item label="Loại hình" name="orgType" rules={[{ required: true }]}>
                            <Select size="large" placeholder="-- Chọn loại hình --">
                                <Select.Option value="MANUFACTURER">Nhà sản xuất</Select.Option>
                                <Select.Option value="DISTRIBUTOR">Nhà phân phối</Select.Option>
                                <Select.Option value="PHARMACY">Nhà thuốc / Bán lẻ</Select.Option>
                                <Select.Option value="HOSPITAL">Bệnh viện</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Mã số thuế" name="taxCode" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: 0100108756" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Số giấy phép (GCN)" name="licenseNumber" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: GCN-GDP-2025-089" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Email liên hệ" name="contactEmail" rules={[{ required: true, type: 'email' }]}>
                            <Input size="large" placeholder="VD: contact@company.com" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Số điện thoại" name="contactPhone" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: 02439364455" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Địa chỉ trụ sở" name="address" rules={[{ required: true }]}>
                            <Input.TextArea rows={2} size="large" placeholder="Nhập địa chỉ chi tiết..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider dashed />

                <Title level={4}>Cơ sở đầu tiên</Title>
                <Row gutter={24}>
                    <Col span={16}>
                        <Form.Item label="Tên cơ sở" name="facilityName" rules={[{ required: true, message: "Vui lòng nhập tên cơ sở" }]}>
                            <Input size="large" placeholder="VD: Nhà máy sản xuất số 1 / Kho tổng miền Nam" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Loại cơ sở" name="facilityType" rules={[{ required: true, message: "Vui lòng chọn loại cơ sở" }]}>
                            <Select size="large" placeholder="-- Chọn loại --">
                                <Select.Option value="FACTORY">Nhà máy sản xuất (FACTORY)</Select.Option>
                                <Select.Option value="WAREHOUSE">Kho bãi (WAREHOUSE)</Select.Option>
                                <Select.Option value="STORE">Cửa hàng thuốc (PHARMACY_STORE)</Select.Option>
                                <Select.Option value="HOSPITAL_DEPT">Kho bệnh viện (HOSPITAL_DEPT)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Giấy phép cơ sở (GPP, GSP, GMP...)" name="facilityLicenseNumber" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: GMP-2025-001" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="SĐT cơ sở" name="facilityContactPhone" rules={[{ required: true }]}>
                            <Input size="large" placeholder="SĐT liên lạc trực tiếp tới kho/nhà máy" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Địa chỉ cơ sở (Nơi thực tế chứa hàng)" name="facilityAddress" rules={[{ required: true }]}>
                            <Input.TextArea rows={2} size="large" placeholder="Địa chỉ kho/nhà máy..." />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider dashed />

                <Row>
                    <Col span={24}>
                        <Form.Item label="Hồ sơ minh chứng (Giấy phép kinh doanh, GPP, GSP, GMP...)">
                            <Dragger 
                                multiple={true} 
                                beforeUpload={() => false}
                                fileList={fileList}
                                onChange={(info) => setFileList(info.fileList)}
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