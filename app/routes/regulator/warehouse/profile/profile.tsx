import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout } from "antd";
import MedicineTable from "components/Table/MedicineTable";
import "components/Header/Header.shared.css";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function ManufacturerWarehouseProfile() {
    const { setHeaderActions } = useHeaderActions();

    const [searchTerm, setSearchTerm] = useState("");
    const [drugType, setDrugType] = useState<string | null>(null);

    const drugTypeOptions = [
        { value: 'OTC', label: 'Thuốc không kê đơn (OTC)' },
        { value: 'PRESCRIPTION', label: 'Thuốc kê đơn' },
        { value: 'VACCINE', label: 'Vaccine' },
        { value: 'BIOLOGIC', label: 'Sinh phẩm y tế' },
    ];

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/regulator/warehouse/batch/create">
                    <Button variant="outlined" icon={<PlusOutlined />} size="large">
                        Tạo lô thuốc
                    </Button>
                </Link>

                <Link to="/regulator/warehouse/profile/create">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Thêm hồ sơ
                    </Button>
                </Link>
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    return (
        <>
            <Layout.Header className="headerLayout">
                <Flex justify='space-between' align='center' gap='large'>
                    <Flex flex={1}>
                        <Input
                            placeholder="Tìm kiếm theo tên thuốc..."
                            size="large"
                            suffix={<SearchOutlined />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Flex>
                    <Flex flex={1} justify='space-between' align='center' gap='small'>
                        <Flex flex={1} justify='flex-end'>
                            <Button 
                                icon={<FilterOutlined />} 
                                size="large"
                                type='text'
                            />
                        </Flex>
                        <Flex flex={1}>
                            <Cascader
                                options={drugTypeOptions}
                                placeholder="-- Chọn loại thuốc --"
                                size="large"
                                style={{ width: "100%" }}
                                onChange={(value) => setDrugType(value ? value[0] : null)}
                                changeOnSelect
                            />
                        </Flex>
                    </Flex>
                </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <MedicineTable searchTerm={searchTerm} drugType={drugType} />
            </Layout.Content>
        </>
    );
}