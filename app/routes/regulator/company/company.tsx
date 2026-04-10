import { FilterOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message } from "antd";
import CompanyTable from "components/Table/CompanyTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { organizationApi } from "api/organizationApi";

export default function RegulatorCompanyManage() {
    const { setHeaderActions } = useHeaderActions();

    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const [queryParams, setQueryParams] = useState({
        page: 1,
        size: 10,
        search: "",
        orgType: undefined as string | undefined
    });

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const response = await organizationApi.getAll({
                page: queryParams.page - 1, 
                size: queryParams.size,
                search: queryParams.search,
                orgType: queryParams.orgType
            });
            
            setCompanies(response.data || response.content || []);
            setTotal(response.totalElements || response.total || 0);
        } catch (error) {
            console.error("Lỗi khi tải danh sách công ty:", error);
            message.error("Không thể tải danh sách tổ chức/công ty!");
        } finally {
            setLoading(false);
        }
    }, [queryParams]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Link to="/regulator/companies/create"> 
                    <Button type="primary" icon={<PlusOutlined />} size="large">
                        Đăng ký tổ chức
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
                        placeholder="Tìm kiếm theo tên công ty, mã số thuế..."
                        size="large"
                        suffix={<SearchOutlined />}
                        onChange={handleSearch}
                        onPressEnter={() => fetchCompanies()}
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
                            placeholder="-- Chọn loại tổ chức --"
                            size="large"
                            style={{ width: "100%" }}
                            options={[
                                { value: 'MANUFACTURER', label: 'Nhà sản xuất' },
                                { value: 'DISTRIBUTOR', label: 'Nhà phân phối' },
                                { value: 'PHARMACY', label: 'Nhà thuốc / Bán lẻ' },
                                { value: 'HOSPITAL', label: 'Bệnh viện / Cơ sở y tế' },
                            ]}
                            onChange={(val) => setQueryParams(prev => ({ ...prev, orgType: val?.[0] as string, page: 1 }))}
                        />
                    </Flex>
                </Flex>
            </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <CompanyTable 
                    dataSource={companies}
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