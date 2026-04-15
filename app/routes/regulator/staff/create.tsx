import { Button, Form, Input, Layout, Row, Col, Select, message, Spin } from "antd";
import { organizationApi } from "api/organizationApi";
import { facilityApi } from "api/facilityApi";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "auth/useAuth";
import { authApi } from "api/employeeApi";

export default function RegulatorStaffCreate() {
    const [form] = Form.useForm();
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    
    const [orgList, setOrgList] = useState<any[]>([]);
    const [facilityList, setFacilityList] = useState<any[]>([]);
    const [loadingOrgs, setLoadingOrgs] = useState(false);
    const [loadingFacilities, setLoadingFacilities] = useState(false);

    const selectedOrgType = Form.useWatch('orgType', form);
    const selectedOrgId = Form.useWatch('orgId', form);

    useEffect(() => {
        if (selectedOrgType && selectedOrgType !== "REGULATOR") {
            setLoadingOrgs(true);
            organizationApi.getAll({ page: 0, size: 100, type: selectedOrgType })
                .then(res => setOrgList(res.data || res.content || []))
                .catch(() => message.error("Lỗi khi tải danh sách tổ chức!"))
                .finally(() => setLoadingOrgs(false));
        } else {
            setOrgList([]);
        }
        form.setFieldsValue({ orgId: undefined, facilityId: undefined });
    }, [selectedOrgType, form]);

    useEffect(() => {
        if (selectedOrgId) {
            setLoadingFacilities(true);
            facilityApi.getByOrgId(selectedOrgId, { page: 1, size: 100 }) 
                .then(res => setFacilityList(res.data || res.content || []))
                .catch(() => message.error("Lỗi khi tải danh sách cơ sở!"))
                .finally(() => setLoadingFacilities(false));
        } else {
            setFacilityList([]);
        }
        form.setFieldsValue({ facilityId: undefined });
    }, [selectedOrgId, form]);

    useEffect(() => {
        setHeaderActions(
            <Button type="primary" size="large" onClick={() => form.submit()} loading={loading}>
                Đăng ký tài khoản
            </Button>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions, form, loading]);

    const onFinish = async (values: any) => {
        try {
            setLoading(true);
            
            let groupString = "";
            if (values.orgType === "REGULATOR") {
                groupString = `REGULATOR///${values.role}`;
            } else {
                groupString = `${values.orgType}/${values.orgId || ''}/${values.facilityId || ''}/${values.role}`;
            }

            const payload = {
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

            await authApi.register(payload); 
            message.success("Tạo tài khoản cán bộ thành công!");
            navigate("/regulator/staff"); 
            
        } catch (error: any) {
            console.error(error);
            message.error("Có lỗi xảy ra khi tạo tài khoản!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout.Content className="contentLayoutTableLevel">
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label="Họ (Last Name)" name="lastName" rules={[{ required: true, message: "Vui lòng nhập họ" }]}>
                            <Input placeholder="VD: Nguyễn Văn" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Tên (First Name)" name="firstName" rules={[{ required: true, message: "Vui lòng nhập tên" }]}>
                            <Input placeholder="VD: A" size="large" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Tên đăng nhập (Username)" name="username" rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}>
                            <Input placeholder="VD: user01" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Mật khẩu khởi tạo" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                            <Input.Password placeholder="Nhập mật khẩu" size="large" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: "Email không hợp lệ" }]}>
                            <Input placeholder="VD: email@domain.com" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}>
                            <Input placeholder="Nhập số điện thoại" size="large" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Số CCCD / CMND" name="identityNumber" rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}>
                            <Input placeholder="Nhập CCCD" size="large" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Hệ thống" name="orgType" rules={[{ required: true, message: "Vui lòng chọn hệ thống" }]}>
                            <Select size="large" placeholder="Chọn loại hình tổ chức">
                                <Select.Option value="REGULATOR">Cơ quan Quản lý (Regulator)</Select.Option>
                                <Select.Option value="MANUFACTURER">Nhà sản xuất (Manufacturer)</Select.Option>
                                <Select.Option value="DISTRIBUTOR">Nhà phân phối (Distributor)</Select.Option>
                                <Select.Option value="PHARMACY">Nhà thuốc (Pharmacy)</Select.Option>
                                <Select.Option value="HOSPITAL">Bệnh viện (Hospital)</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Vai trò (Role)" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}>
                            <Select size="large" placeholder="Chọn chức vụ">
                                <Select.Option value="ADMIN">Quản trị viên (Admin)</Select.Option>
                                {selectedOrgType === "REGULATOR" && (
                                    <Select.Option value="INSPECTOR">Thanh tra viên (Inspector)</Select.Option>
                                )}
                                {selectedOrgType !== "REGULATOR" && (
                                    <Select.Option value="MEMBER">Nhân viên (Member)</Select.Option>
                                )}
                            </Select>
                        </Form.Item>
                    </Col>

                    {selectedOrgType && selectedOrgType !== "REGULATOR" && (
                        <>
                            <Col span={12}>
                                <Form.Item label="Trực thuộc Tổ chức/Công ty" name="orgId" rules={[{ required: true, message: "Vui lòng chọn Tổ chức" }]}>
                                    <Select 
                                        size="large" 
                                        placeholder="-- Chọn công ty --" 
                                        loading={loadingOrgs}
                                        disabled={!selectedOrgType}
                                    >
                                        {orgList.map(org => (
                                            <Select.Option key={org.orgId} value={org.orgId}>{org.orgName}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item label="Trực thuộc Cơ sở / Chi nhánh" name="facilityId">
                                    <Select 
                                        size="large" 
                                        placeholder="-- Chọn cơ sở (Tùy chọn) --" 
                                        loading={loadingFacilities}
                                        disabled={!selectedOrgId}
                                    >
                                        {facilityList.map(fac => (
                                            <Select.Option key={fac.facilityId} value={fac.facilityId}>{fac.facilityName || fac.facilityId}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </>
                    )}
                </Row>
            </Form>
        </Layout.Content>
    );
}