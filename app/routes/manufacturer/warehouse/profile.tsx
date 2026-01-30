import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout } from "antd";
import MedicineTable from "components/Table/MedicineTable";
import "components/Header/Header.shared.css";

export default function ManufacturerWarehouseProfile() {
    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large'>
                <Flex flex={1}>
                    <Input
                        placeholder="Tìm kiếm"
                        size="large"
                        suffix={<SearchOutlined />}
                    />
                </Flex>
                <Flex flex={1} justify='space-between' align='center' gap='small'>
                    <Flex flex={1} justify='flex-end'>
                        <Button 
                            icon={<FilterOutlined />} 
                            size="large"
                            type='text'
                        ></Button>
                    </Flex>
                    <Flex flex={1}>
                        <Cascader
                            placeholder="-- Chọn loại thuốc --"
                            size="large"
                            style={{ width: "100%" }}
                        />
                    </Flex>
                </Flex>
            </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <MedicineTable />
            </Layout.Content>
        </>
    );
}