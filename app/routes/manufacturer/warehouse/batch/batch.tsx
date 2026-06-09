import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi";
import { organizationApi } from "api/organizationApi";
import { useAuth } from "auth/useAuth";
import BatchTable from "components/Table/BatchTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function ManufacturerWarehouseBatch() {
    const { setHeaderActions } = useHeaderActions();
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 7;
    const [searchTerm, setSearchTerm] = useState("");
    
    const { user } = useAuth();

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/manufacturer/warehouse/batch/create">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Tạo lô thuốc
                    </Button>
                </Link>
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    const fetchBatches = async () => {
        setLoading(true);
        try {
            const result = await drugBatchApi.getAll({
                page: 1,
                size: 1000,
                orgId: user?.orgId ?? undefined,
            });
            
            const rawBatches = result.data || result.content || result || [];

            const enrichedBatches = await Promise.all(
                rawBatches.map(async (batch: any) => {
                    let dName = "N/A";
                    let fName = "N/A";

                    try {
                        if (batch.drugId) {
                            const profile = await drugProfileApi.getById(batch.drugId);
                            dName = profile?.data?.drugName || profile?.drugName || batch.drugId;
                        }
                        
                        if (batch.manufacturerOrgId && batch.manufacturerFacilityId) {
                             const facRes = await organizationApi.getFacilities(batch.manufacturerOrgId);
                             const facilities = facRes?.data || facRes || [];
                             const found = facilities.find((f: any) => f.facilityId === batch.manufacturerFacilityId);
                             fName = found ? found.facilityName : batch.manufacturerFacilityId;
                        }
                    } catch (e) {
                        console.log("Lỗi khi đắp dữ liệu cho lô:", batch.batchId);
                    }

                    return {
                        ...batch,
                        drugName: dName,
                        facilityName: fName
                    };
                })
            );

            let filteredBatches = enrichedBatches;
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                filteredBatches = enrichedBatches.filter((item: any) => 
                    item.batchId?.toLowerCase().includes(lowerSearch) || 
                    item.drugName?.toLowerCase().includes(lowerSearch)
                );
            }

            const startIndex = (page - 1) * pageSize;
            const pagedData = filteredBatches.slice(startIndex, startIndex + pageSize);

            setBatches(pagedData);
            setTotal(filteredBatches.length);
            
        } catch (error) {
            console.error("Fetch error:", error);
            message.error("Có lỗi xảy ra khi tải danh sách lô thuốc!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [page, user?.orgId, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large' wrap="wrap">
                <Flex flex={1} style={{ minWidth: 250 }}>
                    <Input
                        placeholder="Tìm kiếm mã lô, mã thuốc..."
                        size="large"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                        suffix={<SearchOutlined />}
                    />
                </Flex>
                <Flex flex={1} justify='space-between' align='center' gap='small' style={{ minWidth: 250 }}>
                    <Flex flex={1} justify='flex-end'>
                        <Button 
                            icon={<FilterOutlined />} 
                            size="large"
                            type='text'
                        ></Button>
                    </Flex>
                    <Flex flex={1}>
                        <Cascader
                            placeholder="-- Chọn loại thuốc --"
                            size="large"
                            style={{ width: "100%" }}
                        />
                    </Flex>
                </Flex>
            </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <BatchTable 
                    dataSource={batches}
                    loading={loading}
                    pagination={{ current: page, pageSize: pageSize }} 
                    total={total}
                    onPageChange={(newPage: number) => setPage(newPage)}
                />
            </Layout.Content>
        </>
    );
}