import type { ColumnsType } from "antd/es/table";

export const columns: ColumnsType<any> = [
  {
    title: "Tên công ty",
    dataIndex: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "ID công ty",
    dataIndex: "companyId",
  },
  {
    title: "Nhóm công ty",
    dataIndex: "group",
  },
  {
    title: "Số cơ sở",
    dataIndex: "facilities",
    sorter: (a, b) => a.facilities - b.facilities,
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <span style={{ color: "#1677ff", cursor: "pointer" }}>
        Xem chi tiết »
      </span>
    ),
  },
];