import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, Layout, Row, Col, Select, Upload, message, Card, DatePicker, InputNumber } from "antd";
import { drugProfileApi } from "api/drugProfileApi";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { useAuth } from "auth/useAuth";

const { TextArea } = Input;

const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

export default function ManufacturerWarehouseCreateProfile() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        setHeaderActions(
            <Button 
                type="primary" 
                size="large" 
                onClick={() => form.submit()}
                loading={loading}
            >
                Lưu hồ sơ thuốc
            </Button>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, form, loading]);

    const onFinish = async (values: any) => {
        if (!user?.orgId) {
            message.error("Lỗi: Không tìm thấy mã Tổ chức của bạn. Vui lòng đăng nhập lại!");
            return;
        }

        setLoading(true);
        try {
            const requestPayload = {
                drugName: values.drugName,
                manufacturerOrgId: user.orgId,
                licenseNumber: values.licenseNumber,
                licenseExpiry: values.licenseExpiry ? dayjs(values.licenseExpiry).toISOString() : null,
                decisionNumber: values.decisionNumber,
                approvalYear: Number(values.approvalYear),
                approvalBatch: String(values.approvalBatch),
                ingredient: values.ingredient,
                strength: values.strength,
                drugType: values.drugType,
                dosageForm: values.dosageForm,
                packaging: values.packaging,
                qualityStandard: values.qualityStandard,
                shelfLife: values.shelfLife ? String(values.shelfLife).trim() : "",
            };

            const formData = new FormData();
            
            formData.append("request", JSON.stringify(requestPayload));

            if (values.documentHashes && values.documentHashes.length > 0) {
                values.documentHashes.forEach((fileItem: any) => {
                    if (fileItem.originFileObj) {
                        formData.append("files", fileItem.originFileObj);
                    }
                });
            }

            await drugProfileApi.createWithFiles(formData);
            
            message.success("Tạo hồ sơ thuốc và tải file thành công!");
            navigate("/manufacturer/warehouse/profile");

        } catch (error) {
            console.error("Lỗi khi tạo hồ sơ thuốc:", error);
            message.error("Có lỗi xảy ra từ máy chủ (500). Vui lòng kiểm tra lại log Backend!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout.Content style={{ padding: '12px'}}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Row gutter={[24, 12]}>
                    {/* BLOCK 1: THÔNG TIN CƠ BẢN */}
                    <Col span={24}>
                        <Card title="Thông tin cơ bản">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="Mã thuốc (Drug ID)" name="drugId" rules={[{ required: true }]}>
                                        <Input placeholder="VD: DRUG_HAPA_001" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Tên thuốc" name="drugName" rules={[{ required: true }]}>
                                        <Input placeholder="VD: Hapacol 500" />
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item label="Nhóm thuốc" name="drugType" rules={[{ required: true }]}>
                                        <Select options={[
                                            { value: "OTC", label: "Không kê đơn (OTC)" },
                                            { value: "PRESCRIPTION", label: "Thuốc kê đơn" },
                                            { value: "VACCINE", label: "Vắc-xin" }
                                        ]} />
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item label="Dạng bào chế" name="dosageForm" rules={[{ required: true }]}>
                                        <Select options={[
                                            { value: "TABLET", label: "Viên nén (TABLET)" },
                                            { value: "CAPSULE", label: "Viên nang (CAPSULE)" },
                                            { value: "INJECTION", label: "Thuốc tiêm" },
                                            { value: "SYRUP", label: "Siro" }
                                        ]} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* BLOCK 2: THÀNH PHẦN & ĐÓNG GÓI */}
                    <Col span={24}>
                        <Card title="Thành phần & Đóng gói">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Thành phần (Ingredient)" name="ingredient" rules={[{ required: true }]}>
                                        <TextArea rows={2} placeholder="VD: Paracetamol..." />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Hàm lượng (Strength)" name="strength" rules={[{ required: true }]}>
                                        <TextArea rows={2} placeholder="VD: 500mg" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Quy cách đóng gói" name="packaging" rules={[{ required: true }]}>
                                        <Input placeholder="VD: Hộp 10 vỉ x 10 viên" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Tiêu chuẩn chất lượng" name="qualityStandard" rules={[{ required: true }]}>
                                        <Input placeholder="VD: TCCS, DĐVN V" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Hạn sử dụng (Shelf Life)" name="shelfLife" rules={[{ required: true }]}>
                                        <Input placeholder="VD: 36 tháng" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* BLOCK 3: HỒ SƠ CẤP PHÉP */}
                    <Col span={24}>
                        <Card title="Hồ sơ cấp phép & Pháp lý">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Form.Item label="Số đăng ký (License No.)" name="licenseNumber" rules={[{ required: true }]}>
                                        <Input placeholder="VD: VD-12345-20" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label="Hạn giấy phép" name="licenseExpiry" rules={[{ required: true }]}>
                                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item label="Số quyết định" name="decisionNumber" rules={[{ required: true }]}>
                                        <Input placeholder="VD: 123/QĐ-QLD" />
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item label="Năm phê duyệt" name="approvalYear" rules={[{ required: true }]}>
                                        <InputNumber style={{ width: '100%' }} min={2000} max={2100} placeholder="VD: 2024" />
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item label="Đợt phê duyệt" name="approvalBatch" rules={[{ required: true }]}>
                                        <Input placeholder="VD: Đợt 101" />
                                    </Form.Item>
                                </Col>
                                
                                <Col span={24}>
                                    <Form.Item
                                        label="Tài liệu minh chứng (Document Hashes)"
                                        name="documentHashes"
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        <Upload name="file" beforeUpload={() => false} multiple>
                                            <Button icon={<UploadOutlined />}>Tải lên tài liệu (PDF, Word...)</Button>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </Layout.Content>
    );
}