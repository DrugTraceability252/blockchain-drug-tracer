import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout } from "antd";
import EmployeeTable from "components/Table/EmployeeTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect } from "react";
import { Link } from "react-router";

export default function ManufacturerStaff() {
    const { setHeaderActions } = useHeaderActions();

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/regulator/staff/register">
                    <Button variant="outlined" icon={<PlusOutlined />} size="large">
                        Duyệt tài khoản
                    </Button>
                </Link>

                <Link to="/regulator/staff/create">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Thêm nhân viên
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
                <EmployeeTable />
            </Layout.Content>
        </>
    );
}