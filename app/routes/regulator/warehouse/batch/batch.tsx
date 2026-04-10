import { SearchOutlined } from "@ant-design/icons";
import { Cascader, Flex, Input, Layout, Table, Tag, message } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { drugBatchApi } from "api/drugBatchApi";
import dayjs from "dayjs";

const qcStatusMap: Record<string, { color: string; label: string }> = {
    PASSED: { color: "green", label: "Đạt chuẩn" },
    FAILED: { color: "red", label: "Không đạt" },
    PENDING: { color: "orange", label: "Chờ kiểm định" }
};

export default function RegulatorBatch() {
    const { setHeaderActions } = useHeaderActions();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchBatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await drugBatchApi.getAll({ page: 1, size: 100 });
            setBatches(res.data || res.content || []);
        } catch (error) {
            message.error("Lỗi tải danh sách lô thuốc!");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBatches();
        setHeaderActions(null); 
    }, [fetchBatches, setHeaderActions]);

    const columns = [
        { title: "Mã lô", dataIndex: "batchId", key: "batchId" },
        { title: "Mã thuốc", dataIndex: "drugId", key: "drugId" },
        { title: "NSX", dataIndex: "manufacturerOrgId", key: "manufacturerOrgId" },
        { title: "Ngày sản xuất", dataIndex: "productionDate", render: (d: string) => dayjs(d).format("DD/MM/YYYY") },
        { 
            title: "Kiểm định (QC)", 
            dataIndex: "qcStatus", 
            render: (status: string) => (
                <Tag color={qcStatusMap[status]?.color || "default"}>
                    {qcStatusMap[status]?.label || status}
                </Tag>
            )
        },
        {
            title: "Hành động",
            render: (record: any) => (
                <Link to={`/regulator/warehouse/batch/${record.batchId}`} style={{ color: '#1890ff', fontWeight: 500 }}>
                    Chi tiết
                </Link>
            )
        }
    ];

    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large'>
                    <Input placeholder="Tra cứu mã lô..." size="large" suffix={<SearchOutlined />} style={{ width: 400 }} />
                </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <Table columns={columns} dataSource={batches} loading={loading} rowKey="batchId" />
            </Layout.Content>
        </>
    );
}