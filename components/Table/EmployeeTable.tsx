import { Table, Pagination, Flex } from "antd";
import { useState } from "react";
import { columns } from "./EmployeeColumn";

interface EmployeeTableProps {
    dataSource: any[];
    loading: boolean;
    pagination: any;
    onChange: (pagination: any) => void;
}

export default function EmployeeTable({ dataSource, loading, pagination, onChange }: EmployeeTableProps) {
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;


    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={columns}
                    dataSource={dataSource}
                    rowKey="id"
                    pagination={false}
                    bordered
                    scroll={{ y: "100%" }}
                />
            </div>

            <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={page}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={setPage}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>
        </Flex>
    );
}