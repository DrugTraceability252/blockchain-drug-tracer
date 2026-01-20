import { Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Medicine } from "constants/type";

const { Link } = Typography;

export const columns: ColumnsType<Medicine> = [
  {
    title: "Tên thuốc",
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
  },
  {
    title: "ID thuốc",
    dataIndex: "id",
    key: "id",
    sorter: (a, b) => a.id.localeCompare(b.id),
  },
  {
    title: "Nhóm thuốc",
    dataIndex: "category",
    key: "category",
    filters: [
      { text: "Generic Medicine", value: "Generic Medicine" },
      { text: "Diabetes", value: "Diabetes" },
    ],
    onFilter: (value, record) => record.category === value,
  },
  {
    title: "Còn hàng",
    dataIndex: "stock",
    key: "stock",
    sorter: (a, b) => a.stock - b.stock,
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <Link onClick={() => console.log("View", record.id)}>
        Xem chi tiết »
      </Link>
    ),
  },
];
