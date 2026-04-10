import { PaperClipOutlined } from "@ant-design/icons";
import { Button, Card, Col, Divider, Empty, Flex, message, Row, Spin, Tag } from "antd";
import { InfoRow } from "components/InfoRow/InfoRow";
import { useCallback, useEffect, useState } from "react";
import { organizationApi } from "api/organizationApi";
import dayjs from "dayjs";

const orgTypeMap: any = {
    MANUFACTURER: { color: "gold", label: "Nhà sản xuất" },
    DISTRIBUTOR: { color: "blue", label: "Nhà phân phối" },
    PHARMACY: { color: "cyan", label: "Nhà thuốc" },
    HOSPITAL: { color: "green", label: "Bệnh viện" },
    REGULATOR: { color: "purple", label: "CQ Quản lý" }
};

export default function RegulatorCompanyApprove() {
    const [pendingOrgs, setPendingOrgs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Lấy những tổ chức đang có status PENDING
    const fetchPendingOrgs = useCallback(async () => {
        setLoading(true);
        try {
            // Giả sử BE hỗ trợ search theo status, nếu không thì lấy tất cả rồi filter
            const response = await organizationApi.getAll({ page: 0, size: 100 });
            const allData = response.data || response.content || [];
            
            // Lọc an toàn ở Frontend cho chắc
            const waitlist = allData.filter((org: any) => org.status === "PENDING");
            setPendingOrgs(waitlist);
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi tải danh sách hồ sơ chờ duyệt!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingOrgs();
    }, [fetchPendingOrgs]);

    // Xử lý Duyệt hồ sơ
    const handleApprove = async (orgId: string) => {
        try {
            setActionLoading(orgId);
            // Cập nhật status thành ACTIVE
            await organizationApi.updateStatus(orgId, "ACTIVE");
            message.success("Đã duyệt hồ sơ tổ chức thành công!");
            
            // Xoá tổ chức khỏi danh sách hiển thị
            setPendingOrgs(prev => prev.filter(org => org.orgId !== orgId));
        } catch (error) {
            console.error(error);
            message.error("Có lỗi xảy ra khi duyệt tổ chức!");
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <Flex justify="center" align="center" style={{ minHeight: '60vh' }}><Spin size="large" tip="Đang tải danh sách..." /></Flex>;
    }

    return (
        <div style={{ padding: 24 }}>
            {pendingOrgs.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 40, borderRadius: 12 }}>
                    <Empty description="Không có hồ sơ công ty/tổ chức nào đang chờ duyệt" />
                </Card>
            ) : (
                <Row gutter={[24, 24]}>
                    {pendingOrgs.map((item) => (
                        <Col span={12} key={item.orgId}>
                            <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: 8}}>
                                <InfoRow label="Tên tổ chức" value={String(item.orgName)} />
                                <InfoRow 
                                    label="Loại hình" 
                                    value={(
                                        <Tag color={orgTypeMap[item.orgType]?.color || "default"}>
                                            {orgTypeMap[item.orgType]?.label || item.orgType}
                                        </Tag>
                                    ) as any} 
                                />
                                <InfoRow label="Mã số thuế" value={String(item.taxCode)} />
                                <InfoRow label="Số giấy phép" value={String(item.licenseNumber)} />
                                <InfoRow label="Email liên hệ" value={String(item.contactEmail)} />
                                <InfoRow label="Số điện thoại" value={String(item.contactPhone)} />
                                <InfoRow label="Ngày nộp hồ sơ" value={dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")} />

                                <div
                                    style={{
                                        marginTop: 16,
                                        border: "1px dashed #d9d9d9",
                                        borderRadius: 8,
                                        padding: "8px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        color: "#1677ff",
                                        backgroundColor: "#f0f5ff",
                                        cursor: "pointer"
                                    }}
                                >
                                    <PaperClipOutlined />
                                    {item.documentHashes?.length ? `${item.documentHashes.length} tài liệu đính kèm` : "Chưa có tài liệu đính kèm"}
                                </div>

                                <Divider style={{ margin: '16px 0px' }} />

                                <Flex justify="space-between" align="center">
                                    <Button danger>Từ chối</Button>
                                    <Button 
                                        type="primary" 
                                        loading={actionLoading === item.orgId}
                                        onClick={() => handleApprove(item.orgId)}
                                    >
                                        Chấp nhận
                                    </Button>
                                </Flex>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
}