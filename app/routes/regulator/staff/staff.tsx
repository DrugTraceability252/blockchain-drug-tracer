import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message } from "antd";
import EmployeeTable from "components/Table/EmployeeTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function RegulatorStaff() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth(); 

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    
    const [queryParams, setQueryParams] = useState({
        page: 1,
        size: 10,
        search: "",
        role: undefined as string | undefined
    });

    const fetchEmployees = useCallback(async () => {
        if (!user) return; 

        setLoading(true);
        try {
            const response = await employeeApi.getAll({
                orgId: user.orgId || "", 
                
                page: queryParams.page - 1,
                size: queryParams.size,
                search: queryParams.search,
                role: queryParams.role
            });
            
            setEmployees(response.data || response.content || []);
            setTotal(response.totalElements || response.total || 0);
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
            message.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

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
                        Thêm cán bộ / nhân viên
                    </Button>
                </Link>
            </Flex>
        );
        return () => setHeaderActions(null);
    }, [setHeaderActions]);

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
                        placeholder="Tìm kiếm theo tên, tài khoản, email..."
                        size="large"
                        suffix={<SearchOutlined />}
                        onPressEnter={() => fetchEmployees()} 
                        onChange={handleSearch}
                    />
                </Flex>
                <Flex flex={1} justify='space-between' align='center' gap='small'>
                    <Flex flex={1} justify='flex-end'>
                        <Button icon={<FilterOutlined />} size="large" type='text' />
                    </Flex>
                    <Flex flex={1}>
                        <Cascader
                            placeholder="-- Lọc theo vai trò --"
                            size="large"
                            style={{ width: "100%" }}
                            options={[
                                { value: 'ADMIN', label: 'Quản trị viên' },
                                { value: 'INSPECTOR', label: 'Thanh tra / Cán bộ duyệt' },
                            ]}
                            onChange={(val) => setQueryParams(prev => ({ ...prev, role: val?.[0] as string, page: 1 }))}
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