import { SearchOutlined } from "@ant-design/icons";
import { Cascader, Flex, Input } from "antd";
import MedicineTable from "components/Table/MedicineTable";

export default function ManufacturerWarehouseProfile() {
    return (
        <>
            <Flex>
                <Input
                    placeholder="Tìm kiếm"
                    size="large"
                    suffix={<SearchOutlined />}
                />
                <Cascader
                    placeholder="Chọn loại thuốc"
                    size="large"
                />
            </Flex>
            
            <MedicineTable />
        </>
    );
}