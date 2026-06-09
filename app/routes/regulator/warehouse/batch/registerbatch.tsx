import { CheckCircleOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Flex, Input, Layout, Table, Tag, message, Image } from "antd";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi";
import { organizationApi } from "api/organizationApi";
import dayjs from "dayjs";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const qcStatusMap: Record<string, { color: string; label: string }> = {
    PASSED: { color: "green", label: "Đạt chuẩn" },
    FAILED: { color: "red", label: "Không đạt" },
    PENDING: { color: "orange", label: "Chờ kiểm định" }
};

export default function RegulatorRegisterBatch() {
    const { setHeaderActions } = useHeaderActions();
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchBatches = useCallback(async () => {
        setLoading(true);
        try {
            const res = await drugBatchApi.getAll({ page: 1, size: 100 });
            const rawBatches = res.data || res.content || [];

            const pendingBatches = rawBatches.filter((batch: any) => batch.qcStatus === "PENDING");

            const enrichedBatches = await Promise.all(
                pendingBatches.map(async (batch: any) => {
                    let dName = batch.drugId; 
                    let oName = batch.manufacturerOrgId;

                    try {
                        if (batch.drugId) {
                            const profile = await drugProfileApi.getById(batch.drugId);
                            dName = profile?.data?.drugName || profile?.drugName || batch.drugId;
                        }
                        
                        if (batch.manufacturerOrgId) {
                            const org = await organizationApi.getById(batch.manufacturerOrgId);
                            oName = org?.data?.orgName || org?.orgName || batch.manufacturerOrgId;
                        }
                    } catch (e) {
                        console.log("Lỗi khi đắp dữ liệu cho lô:", batch.batchId);
                    }

                    return {
                        ...batch,
                        drugName: dName,
                        orgName: oName
                    };
                })
            );

            setBatches(enrichedBatches);
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
        { 
            title: "Mã lô & QR", 
            dataIndex: "batchId", 
            key: "batchId", 
            render: (text: string) => (
                <Image
                    width={64}
                    height={64}
                    src={`${API_BASE_URL}/files/preview?objectName=qrcode/${text}/batch.jpg`}
                    fallback="https://via.placeholder.com/64?text=No+QR"
                    style={{ borderRadius: 6, border: '1px solid #f0f0f0' }}
                />
            ) 
        },
        { 
            title: "Sản phẩm", 
            dataIndex: "drugName",
            key: "drugName",
            render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        { 
            title: "Nhà sản xuất", 
            dataIndex: "orgName",
            key: "orgName" 
        },
        { 
            title: "Ngày sản xuất", 
            dataIndex: "productionDate", 
            render: (d: string) => d ? dayjs(d).format("DD/MM/YYYY") : "—" 
        },
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
                <Flex gap="middle" align="center">
                    <Link to={`/regulator/warehouse/batch/${record.batchId}`} style={{ color: '#1890ff', fontSize: 18 }}>
                        <EyeOutlined title="Xem chi tiết" />
                    </Link>

                    {record.qcStatus === "PENDING" && (
                        <Link to={`/regulator/warehouse/batch/${record.batchId}`} style={{ color: '#52c41a', fontSize: 18 }}>
                            <CheckCircleOutlined title="Kiểm định lô này" />
                        </Link>
                    )}
                </Flex>
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
                <Table 
                    columns={columns} 
                    dataSource={batches} 
                    loading={loading} 
                    rowKey="batchId" 
                    pagination={{ defaultPageSize: 10 }}
                    locale={{ emptyText: "Không có lô thuốc nào đang chờ kiểm định" }}
                />
            </Layout.Content>
        </>
    );
}