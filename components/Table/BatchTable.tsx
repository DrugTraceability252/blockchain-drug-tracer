import { Table, Pagination, Flex } from "antd";
import { useState } from "react";
import { MedicineData } from "constants/MockMedicineData";
import { BatchData } from "constants/MockBatchData";
import { columns } from "./BatchColumn";

export default function BatchTable() {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const data = BatchData.slice(start, end);

    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered
                    scroll={{ y: '100%' }}
                />
            </div>

            <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={MedicineData.length}
                    onChange={setPage}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>
        </Flex>
    );
}
