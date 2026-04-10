import { Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link as RouterLink } from "react-router";
import type { Medicine } from "constants/type";

const { Link } = Typography;

export const columns: ColumnsType<Medicine> = [
  {
    title: "Tên thuốc",
    dataIndex: "drugName",
    key: "name",
    sorter: (a, b) => a.drugName.localeCompare(b.drugName),
  },
  {
    title: "ID thuốc",
    dataIndex: "drugId",
    key: "id",
    sorter: (a, b) => a.drugId.localeCompare(b.drugId),
  },
  {
    title: "Nhóm thuốc",
    dataIndex: "drugType",
    key: "drugType",
    filters: [
      { text: "Generic Medicine", value: "Generic Medicine" },
      { text: "Diabetes", value: "Diabetes" },
    ],
    onFilter: (value, record) => record.drugType === value,
  },
  {
    title: "Loại thuốc",
    dataIndex: "type",
    key: "type",
    
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <RouterLink to={`/manufacturer/warehouse/profile/${record.drugId}`}>
        <Link>Xem chi tiết</Link>
      </RouterLink>
    ),
  },
];
