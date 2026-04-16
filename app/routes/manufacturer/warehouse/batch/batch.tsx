import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message } from "antd";
import { drugBatchApi } from "api/drugBatchApi";
import { useAuth } from "auth/useAuth";
import BatchTable from "components/Table/BatchTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { use, useEffect, useState } from "react";
import { Link } from "react-router";

export default function ManufacturerWarehouseBatch() {
    const { setHeaderActions } = useHeaderActions();
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;
    
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
                size: 10,
                orgId: user?.orgId ?? undefined,
            });
            setBatches(result.data || []);
            setTotal(result.total || 0);
        } catch (error) {
            console.error("Fetch error:", error);
            message.error("Có lỗi xảy ra khi tải danh sách lô thuốc!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [page]);

    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large'>
                <Flex flex={1}>
                    <Input
                        placeholder="Tìm kiếm"
                        size="large"
                        suffix={<SearchOutlined />}
                    />
                </Flex>
                <Flex flex={1} justify='space-between' align='center' gap='small'>
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
                    onPageChange={setPage}
                />
            </Layout.Content>
        </>
    );
}