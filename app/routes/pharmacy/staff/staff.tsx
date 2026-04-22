import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message } from "antd";
import EmployeeTable from "components/Table/EmployeeTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

export default function DistributorStaff() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const fetchEmployees = useCallback(async () => {
        if (!user?.orgId) return;

        setLoading(true);
        try {
            const response = await employeeApi.getAll({
                orgId: user.orgId,
                page: page - 1,
                size: pageSize,
            });
            
            setEmployees(response.data || response.content || []);
            setTotal(response.totalElements || response.total || 0);
        } catch (error) {
            console.error("Lỗi khi tải danh sách nhân viên:", error);
            message.error("Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    }, [user?.orgId, page]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/distributor/staff/register">
                    <Button variant="outlined" icon={<PlusOutlined />} size="large">
                        Duyệt tài khoản
                    </Button>
                </Link>

                <Link to="/distributor/staff/create">
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
                <EmployeeTable 
                    dataSource={employees}
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: pageSize,
                        total: total,
                    }}
                    onChange={(p) => setPage(p)}
                />
            </Layout.Content>
        </>
    );
}