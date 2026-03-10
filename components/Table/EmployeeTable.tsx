import { Table, Pagination, Flex } from "antd";
import { useState } from "react";
import { MockEmployeeData } from "constants/MockEmployeeData";
import { columns } from "./EmployeeColumn";

export default function EmployeeTable() {
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const data = MockEmployeeData.slice(start, end);

    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered
                    scroll={{ y: "100%" }}
                />
            </div>

            <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={MockEmployeeData.length}
                    onChange={setPage}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>
        </Flex>
    );
}