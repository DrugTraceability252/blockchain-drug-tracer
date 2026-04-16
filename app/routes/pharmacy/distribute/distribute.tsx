import { FilterOutlined, InboxOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout } from "antd";
import BatchTable from "components/Table/BatchTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function DistributorWarehouseBatch() {
    const { setHeaderActions } = useHeaderActions();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/distributor/warehouse/batch/receive">
                    <Button type="primary" icon={<InboxOutlined />} size="large">
                        Nhập kho
                    </Button>
                </Link>
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large'>
                    <Flex flex={1}>
                        <Input
                            placeholder="Tìm kiếm mã lô thuốc..."
                            size="large"
                            suffix={<SearchOutlined />}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            allowClear
                        />
                    </Flex>
                    <Flex flex={1} justify='space-between' align='center' gap='small'>
                        <Flex flex={1} justify='flex-end'>
                            <Button 
                                icon={<FilterOutlined />} 
                                size="large"
                                type='text'
                            />
                        </Flex>
                        <Flex flex={1}>
                            <Cascader
                                placeholder="-- Trạng thái kho --"
                                size="large"
                                style={{ width: "100%" }}
                                options={[
                                    { value: 'IN_TRANSIT', label: 'Đang vận chuyển đến' },
                                    { value: 'STORED', label: 'Đang lưu kho' },
                                    { value: 'DISTRIBUTED', label: 'Đã phân phối đi' }
                                ]}
                                onChange={(val) => setStatusFilter(val ? val[0] as string : null)}
                                changeOnSelect
                            />
                        </Flex>
                    </Flex>
                </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <BatchTable 
                    dataSource={batches}
                    loading={loading}
                    pagination={{ current: page, pageSize: 10 }}
                    total={total}
                    onPageChange={setPage}
                />
            </Layout.Content>
        </>
    );
}