import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Layout, Row, Col, Select, Card, DatePicker, Upload, message } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "auth/useAuth";
import dayjs from "dayjs";
import { organizationApi } from "api/organizationApi";

const normFile = (e: any) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
};

export default function ManufacturerWarehouseCreateBatch() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const { user } = useAuth();
    
    const [drugs, setDrugs] = useState<any[]>([]);
    const [loadingDrugs, setLoadingDrugs] = useState(false);

    const [facilities, setFacilities] = useState<any[]>([]);
    const [loadingFacilities, setLoadingFacilities] = useState(false);

    useEffect(() => {
        const fetchDrugs = async () => {
            if (!user?.orgId) return;
            setLoadingDrugs(true);
            try {
                const res = await drugProfileApi.getAll({ page: 1, size: 100 });
                
                const allDrugs = res.data?.data || res.data || res.content || [];
                
                console.log("1. Tổng số thuốc tải về:", allDrugs.length);
                console.log("2. Mã công ty của tôi (user.orgId):", user.orgId);

                const myDrugs = allDrugs.filter((d: any) => {
                    const isMyCompany = d.manufacturerOrgId === user.orgId;
                    const isApproved = d.approveStatus === "APPROVED";
                    
                    return isMyCompany && isApproved;
                });

                console.log("3. Số thuốc thỏa mãn điều kiện vào Dropdown:", myDrugs.length);
                
                setDrugs(myDrugs);
            } catch (error) {
                console.error("Lỗi lấy danh sách thuốc:", error);
                message.error("Không thể tải danh sách thuốc!");
            } finally {
                setLoadingDrugs(false);
            }
        };
        fetchDrugs();
    }, [user?.orgId]);

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
        if (!user?.orgId) {
            message.error("Lỗi: Không xác định được mã Công ty. Vui lòng đăng nhập lại!");
            return;
        }

        setLoading(true);
        try {
            const documentHashes = values.documentHashes?.map((f: any) => f.name) || ["hash_demo_batch"];

            const payload = {
                drugId: values.drugId,
                manufacturerFacilityId: values.manufacturerFacilityId,
                manufacturerOrgId: user.orgId, 
                
                productionDate: values.productionDate ? dayjs(values.productionDate).toISOString() : new Date().toISOString(),
                expiryDate: values.expiryDate ? dayjs(values.expiryDate).toISOString() : new Date().toISOString(),
                
                totalBoxes: Number(values.totalBoxes), 
                unit: values.unit,
                documentHashes: documentHashes
            };

            await drugBatchApi.create(payload);
            message.success("Tạo lô thuốc mới thành công!");
            navigate("/manufacturer/warehouse/batch");

        } catch (error) {
            console.error("Lỗi khi tạo lô:", error);
            message.error("Có lỗi xảy ra từ máy chủ (500). Vui lòng kiểm tra lại log Backend!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchFacilities = async () => {
            if (!user?.orgId) return;
            setLoadingFacilities(true);
            try {
                const res = await organizationApi.getFacilities(user.orgId);
                const data = res.data || res || [];
                setFacilities(data);
            } catch (error) {
                console.error("Lỗi lấy danh sách cơ sở:", error);
                message.error("Không thể tải danh sách cơ sở sản xuất!");
            } finally {
                setLoadingFacilities(false);
            }
        };
        fetchFacilities();
    }, [user?.orgId]);

    return (
        <Layout.Content style={{ padding: '12px'}}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
            >
                <Row gutter={[24, 24]}>
                    <Col span={24}>
                        <Card title="Thông tin định danh Lô">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Sản phẩm Thuốc (Drug)"
                                        name="drugId"
                                        rules={[{ required: true, message: "Vui lòng chọn thuốc" }]}
                                    >
                                        <Select
                                            size="large"
                                            placeholder="-- Tìm và chọn thuốc muốn sản xuất --"
                                            loading={loadingDrugs}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) => 
                                                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {drugs.map(drug => (
                                                <Select.Option key={drug.drugId} value={drug.drugId}>
                                                    {drug.drugName}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                            </div>
                        </Card>
                    </Col>

                    <Col span={24}>
                        <Card title="Thông tin sản xuất">
                            <div style={{padding: 8}}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Cơ sở sản xuất (Facility)"
                                        name="manufacturerFacilityId"
                                        rules={[{ required: true, message: "Vui lòng chọn cơ sở" }]}
                                    >
                                        <Select
                                            size="large"
                                            placeholder="-- Chọn nhà máy/kho sản xuất --"
                                            loading={loadingFacilities}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {facilities.map((fac) => (
                                                <Select.Option key={fac.facilityId} value={fac.facilityId}>
                                                    {fac.facilityName} ({fac.address})
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="Ngày sản xuất"
                                        name="productionDate"
                                        rules={[{ required: true, message: "Chọn ngày sản xuất" }]}
                                    >
                                        <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item
                                        label="Hạn sử dụng"
                                        name="expiryDate"
                                        rules={[{ required: true, message: "Chọn hạn sử dụng" }]}
                                    >
                                        <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Số lượng đóng gói"
                                        name="totalBoxes"
                                        rules={[{ required: true, message: "Nhập số lượng" }]}
                                    >
                                        <InputNumber size="large" style={{ width: "100%" }} min={1} placeholder="VD: 50000" />
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
                                            size="large"
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
                                            <Button size="large" icon={<UploadOutlined />}>Tải lên PDF/Hình ảnh</Button>
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