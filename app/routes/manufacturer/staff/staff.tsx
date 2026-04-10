import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message } from "antd";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";
import EmployeeTable from "components/Table/EmployeeTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

export default function ManufacturerStaff() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [queryParams, setQueryParams] = useState({
        page: 1,
        size: 10,
        search: "",
        role: undefined
    });
    

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/manufacturer/staff/register">
                    <Button variant="outlined" icon={<PlusOutlined />} size="large">
                        Duyệt tài khoản
                    </Button>
                </Link>

                <Link to="/manufacturer/staff/create">
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Thêm nhân viên
                    </Button>
                </Link>
            </Flex>
        );

        return () => setHeaderActions(null);
    }, [setHeaderActions]);

    const fetchEmployees = useCallback(async () => {
        if (!user?.orgId) return; 
        
        try {
            setLoading(true);
            const response = await employeeApi.getAll({
                orgId: user.orgId, 
                page: queryParams.page,
                size: queryParams.size,
                search: queryParams.search,
                role: queryParams.role
            });
            
            setEmployees(response.data || []);
            setTotal(response.total || 0);
            
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
            message.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId, queryParams]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQueryParams(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handleTableChange = (pagination: any) => {
        setQueryParams(prev => ({
            ...prev,
            page: pagination.current,
            size: pagination.pageSize,
        }));
    };

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
                <EmployeeTable 
                    dataSource={employees} 
                    loading={loading} 
                    pagination={{
                        current: queryParams.page,
                        pageSize: queryParams.size,
                        total: total,
                        showSizeChanger: true
                    }}
                    onChange={handleTableChange}
                />
            </Layout.Content>
        </>
    );
}