import { SearchOutlined } from "@ant-design/icons";
import { Cascader, Flex, Input, Layout, Table, Tag, message, Button, Modal } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { drugProfileApi } from "api/drugProfileApi";
import { Link } from "react-router";

const statusMap: Record<string, { color: string; label: string }> = {
    APPROVED: { color: "green", label: "Đã cấp phép" },
    REJECTED: { color: "red", label: "Từ chối" },
    PENDING: { color: "orange", label: "Chờ phê duyệt" }
};

export default function RegulatorDrugProfile() {
    const { setHeaderActions } = useHeaderActions();
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDrugs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await drugProfileApi.getAll({ page: 1, size: 100 });
            setDrugs(res.data || res.content || []);
        } catch (error) {
            message.error("Lỗi tải danh sách hồ sơ thuốc!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDrugs();
        setHeaderActions(null);
    }, [fetchDrugs, setHeaderActions]);

    const handleApprove = (drugId: string, status: string) => {
        Modal.confirm({
            title: status === "APPROVED" ? "Cấp phép hồ sơ thuốc?" : "Từ chối hồ sơ thuốc?",
            content: "Bạn có chắc chắn với quyết định này? Thông tin sẽ được ghi vào Blockchain.",
            onOk: async () => {
                try {
                    await drugProfileApi.updateStatus(drugId, status);
                    message.success("Đã cập nhật trạng thái hồ sơ!");
                    fetchDrugs();
                } catch (error) {
                    message.error("Lỗi khi cập nhật!");
                }
            }
        });
    };

    const columns = [
        { title: "Mã thuốc", dataIndex: "drugId", key: "drugId" },
        { title: "Tên thuốc", dataIndex: "drugName", key: "drugName", render: (text: string) => <b>{text}</b> },
        { title: "Dạng bào chế", dataIndex: "dosageForm", key: "dosageForm" },
        { title: "Nhà sản xuất", dataIndex: "manufacturerOrgId", key: "manufacturerOrgId" },
        { 
            title: "Trạng thái", 
            key: "status",
            render: (record: any) => (
                record.status === "PENDING" ? (
                    <Flex gap="small">
                        <Button size="small" type="primary" onClick={() => handleApprove(record.drugId, "APPROVED")}>Duyệt</Button>
                        <Button size="small" danger onClick={() => handleApprove(record.drugId, "REJECTED")}>Từ chối</Button>
                    </Flex>
                ) : (
                    <span style={{ color: '#ccc' }}>Đã xử lý</span>
                )
            )
        },
        {
            title: "Hành động",
            key: "action",
            render: (record: any) => (
                <Link to={`/regulator/warehouse/profile/${record.drugId}`} style={{ color: '#1890ff', fontWeight: 500 }}>
                    Chi tiết
                </Link>
            )
        }
    ];

    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large'>
                    <Input placeholder="Tìm kiếm tên thuốc..." size="large" suffix={<SearchOutlined />} style={{ width: 400 }} />
                    <Cascader placeholder="-- Lọc trạng thái --" size="large" options={[{ value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đã duyệt' }]} />
                </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <Table columns={columns} dataSource={drugs} loading={loading} rowKey="drugId" />
            </Layout.Content>
        </>
    );
}