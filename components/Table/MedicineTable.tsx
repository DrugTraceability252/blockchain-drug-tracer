import { Table } from "antd";
import { columns } from "./Column";
import { MedicineData } from "constants/MockMedicineData";

export default function MedicineTable() {
    return (
        <Table
            columns={columns}
            dataSource={MedicineData}
            pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showQuickJumper: false,
            }}
            bordered
        />
    );
}
