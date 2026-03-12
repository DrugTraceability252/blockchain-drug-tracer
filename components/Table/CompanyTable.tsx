import { Table, Pagination, Flex } from "antd";
import { useState } from "react";
import { columns } from "./CompanyColumn";
import { CompanyData } from "constants/MockCompanyData";
import { useNavigate } from "react-router";

export default function CompanyTable() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const pageSize = 8;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const data = CompanyData.slice(start, end);

  return (
    <Flex vertical style={{ height: "100%" }}>
      <div style={{ flex: 1 }}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          bordered
          rowKey="id"
          onRow={(record) => ({
            onClick: () => {
              navigate(`${record.id}`, {
                state: record,
              });
            },
            style: { cursor: "pointer" },
          })}
        />
      </div>

      <Flex justify="space-between" style={{ padding: "12px 16px" }}>
        <span>
          {start + 1} - {Math.min(end, CompanyData.length)} / {CompanyData.length}
        </span>

        <Pagination
          current={page}
          pageSize={pageSize}
          total={CompanyData.length}
          onChange={setPage}
          showSizeChanger={false}
        />
      </Flex>
    </Flex>
  );
}