import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Layout, Row, Col, Select, Card, DatePicker, Upload, message } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

// Hàm xử lý file cho component Upload của Ant Design
const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

export default function ManufacturerWarehouseCreateBatch() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setHeaderActions(
            <Button 
                type="primary" 
                size="large" 
                onClick={() => form.submit()}
                loading={loading}
            >
                Lưu thông tin Lô
            </Button>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions, form, loading]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const documentHashes = values.documentHashes?.map((f: any) => f.name) || ["hash_demo_batch"];

            const payload = {
                batchId: values.batchId,
                drugId: values.drugId,
                manufacturerFacilityId: values.manufacturerFacilityId,
                manufacturerOrgId: "ORG001", // Hardcode mã tổ chức (thường lấy từ user đăng nhập)
                // Chuyển đổi DatePicker sang chuẩn ISO 8601
                productionDate: values.productionDate ? values.productionDate.toISOString() : new Date().toISOString(),
                expiryDate: values.expiryDate ? values.expiryDate.toISOString() : new Date().toISOString(),
                totalBoxes: values.totalBoxes, // int32
                unit: values.unit,
                documentHashes: documentHashes
            };

            await drugBatchApi.create(payload);
            message.success("Tạo lô thuốc thành công!");
            
            // Điều hướng về trang danh sách lô thuốc
            navigate("/manufacturer/warehouse/batch");

        } catch (error) {
            console.error("Lỗi khi tạo lô:", error);
            message.error("Có lỗi xảy ra khi tạo lô thuốc. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout.Content style={{ padding: '12px'}}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={[24, 24]}>
                    {/* BLOCK 1: THÔNG TIN ĐỊNH DANH */}
                    <Col span={24}>
                        <Card title="Thông tin định danh Lô">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Mã Lô (Batch ID)"
                                        name="batchId"
                                        rules={[{ required: true, message: "Vui lòng nhập mã lô" }]}
                                    >
                                        <Input placeholder="VD: BATCH_HAPA_260301" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Mã thuốc (Drug ID)"
                                        name="drugId"
                                        rules={[{ required: true, message: "Vui lòng nhập ID thuốc" }]}
                                    >
                                        <Input placeholder="VD: DRUG_HAPA_001" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* BLOCK 2: SẢN XUẤT & THỜI HẠN */}
                    <Col span={24}>
                        <Card title="Thông tin sản xuất">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Cơ sở sản xuất (Facility ID)"
                                        name="manufacturerFacilityId"
                                        rules={[{ required: true, message: "Vui lòng chọn hoặc nhập cơ sở" }]}
                                    >
                                        {/* Bạn có thể đổi thành Input nếu chưa có API lấy danh sách cơ sở */}
                                        <Select
                                            placeholder="Chọn cơ sở sản xuất"
                                            options={[
                                                { value: "FAC_HCM_001", label: "Nhà máy Quận 9 (FAC_HCM_001)" },
                                                { value: "FAC_BD_002", label: "Nhà máy Bình Dương (FAC_BD_002)" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="Ngày sản xuất"
                                        name="productionDate"
                                        rules={[{ required: true, message: "Chọn ngày sản xuất" }]}
                                    >
                                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="Hạn sử dụng"
                                        name="expiryDate"
                                        rules={[{ required: true, message: "Chọn hạn sử dụng" }]}
                                    >
                                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Số lượng đóng gói"
                                        name="totalBoxes"
                                        rules={[{ required: true, message: "Nhập số lượng" }]}
                                    >
                                        <InputNumber style={{ width: "100%" }} min={1} placeholder="VD: 50000" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Đơn vị tính"
                                        name="unit"
                                        initialValue="Hộp"
                                        rules={[{ required: true, message: "Chọn đơn vị" }]}
                                    >
                                        <Select
                                            options={[
                                                { value: "Hộp", label: "Hộp" },
                                                { value: "Vỉ", label: "Vỉ" },
                                                { value: "Lọ", label: "Lọ" },
                                                { value: "Thùng", label: "Thùng" },
                                            ]}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* BLOCK 3: SỐ LƯỢNG & TÀI LIỆU */}
                    <Col span={24}>
                        <Card title="Minh chứng">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                

                                <Col span={24}>
                                    <Form.Item
                                        label="Hồ sơ kiểm nghiệm lô (QC Documents)"
                                        name="documentHashes"
                                        valuePropName="fileList"
                                        getValueFromEvent={normFile}
                                    >
                                        <Upload name="file" beforeUpload={() => false} multiple>
                                            <Button icon={<UploadOutlined />}>Tải lên PDF/Hình ảnh</Button>
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