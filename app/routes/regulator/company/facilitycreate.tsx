import { Button, Col, Form, Input, Layout, Row, Select, message, Typography } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router"; // 🌟 Bỏ useParams
import { organizationApi } from "api/organizationApi";

const { Title } = Typography;

export default function FacilityCreate() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [fetchingOrgs, setFetchingOrgs] = useState(false);

    const fetchCompanies = useCallback(async () => {
        setFetchingOrgs(true);
        try {
            const response = await organizationApi.getAll({ page: 0, size: 1000 }); // Lấy số lượng lớn
            const allData = response.data || response.content || [];
            
            // Tùy chọn: Bạn có thể chỉ lọc những công ty đã được duyệt (ACTIVE)
            const activeOrgs = allData.filter((org: any) => org.status === "ACTIVE");
            setCompanies(activeOrgs);
        } catch (error) {
            console.error(error);
            message.error("Không thể tải danh sách công ty!");
        } finally {
            setFetchingOrgs(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        setHeaderActions(
            <Button 
                type="primary" 
                size="large" 
                onClick={() => form.submit()}
                loading={loading}
            >
                Lưu Cơ sở mới
            </Button>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, form, loading]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const payload = {
                facilityName: values.facilityName,
                facilityType: values.facilityType,
                licenseNumber: values.licenseNumber,
                address: values.address,
                contactPhone: values.contactPhone
            };

            await organizationApi.createFacility(values.orgId, payload);
            message.success("Thêm cơ sở vật chất mới thành công!");
            
            navigate(`/regulator/company/${values.orgId}`);
        } catch (error: any) {
            console.error(error);
            message.error("Có lỗi xảy ra khi tạo cơ sở!");
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
                    <Col span={24}>
                        <Form.Item 
                            label="Thuộc Tổ chức / Công ty" 
                            name="orgId" 
                            rules={[{ required: true, message: "Vui lòng chọn công ty sở hữu cơ sở này!" }]}
                        >
                            <Select 
                                size="large" 
                                placeholder="-- Gõ tên công ty hoặc mã số thuế để tìm kiếm --"
                                loading={fetchingOrgs}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) => 
                                    String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {companies.map((org) => (
                                    <Select.Option key={org.orgId} value={org.orgId}>
                                        {org.orgName} (MST: {org.taxCode})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={16}>
                        <Form.Item label="Tên cơ sở" name="facilityName" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: Kho tổng miền Trung" />
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label="Loại cơ sở" name="facilityType" rules={[{ required: true }]}>
                            <Select size="large" placeholder="-- Chọn loại --">
                                <Select.Option value="FACTORY">Nhà máy sản xuất</Select.Option>
                                <Select.Option value="WAREHOUSE">Kho bãi</Select.Option>
                                <Select.Option value="PHARMACY_STORE">Cửa hàng thuốc</Select.Option>
                                <Select.Option value="HOSPITAL_DEPT">Kho bệnh viện</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Giấy phép cơ sở (Mã GPP, GSP, GMP...)" name="licenseNumber" rules={[{ required: true }]}>
                            <Input size="large" placeholder="VD: GSP-2025-001" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Số điện thoại cơ sở" name="contactPhone" rules={[{ required: true }]}>
                            <Input size="large" placeholder="SĐT liên lạc của cơ sở này" />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Địa chỉ thực tế" name="address" rules={[{ required: true }]}>
                            <Input.TextArea rows={3} size="large" placeholder="Nhập địa chỉ..." />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Layout.Content>
    );
}