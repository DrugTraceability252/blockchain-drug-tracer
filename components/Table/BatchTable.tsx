import { Table, Pagination, Flex, type TableProps, type TableColumnsType } from "antd";
import { columns } from "./BatchColumn";
import { useNavigate } from "react-router";

interface BatchTableProps extends TableProps<any> {
    total?: number;
    onPageChange?: (page: number) => void;
}

export default function BatchTable({ 
    dataSource, 
    pagination, 
    total, 
    onPageChange, 
    loading 
}: BatchTableProps) {
    const navigate = useNavigate();

    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={columns() as TableColumnsType<any>}
                    dataSource={dataSource}
                    pagination={false}
                    bordered
                    scroll={{ y: '100%' }}
                    rowKey="batchId"
                    loading={loading}
                    onRow={(record) => ({
                        onClick: () => {
                            navigate(`${record.batchId}`, {
                                state: record
                            });
                        },
                        style: { cursor: "pointer" }
                    })}
                />
            </div>
            {pagination !== false && <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={pagination?.current}
                    pageSize={pagination?.pageSize}
                    total={total}
                    onChange={onPageChange}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>}
        </Flex>
    );
}
