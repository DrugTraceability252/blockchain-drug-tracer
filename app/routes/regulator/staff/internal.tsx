import { FilterOutlined, PlusOutlined, SearchOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message, Modal, Spin, List, Typography } from "antd";
import EmployeeTable from "components/Table/EmployeeTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { authApi, employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

const { Text } = Typography;

export default function RegulatorInternalStaff() {
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

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const response = await employeeApi.getAll({
                orgId: "REGULATOR", 
                
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
        
    }, [queryParams]); // Đã bỏ user?.orgId ra khỏi dependency vì ta ép cứng rồi

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

    const handleOpenDocuments = async (userId: string) => {
        setSelectedUserId(userId);
        setIsDocModalOpen(true);
        setLoadingDocs(true);
        try {
            const res = await authApi.getDocuments(userId);
            
            let docList = [];
            if (Array.isArray(res)) {
                docList = res;
            } else if (res && Array.isArray(res.data)) {
                docList = res.data;
            }

            setDocuments(docList);
            
            if (docList.length === 0) {
                message.warning("Tài khoản này chưa có tài liệu nào được đính kèm!");
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách file:", error);
            message.error("Không thể tải danh sách tài liệu đính kèm!");
            setDocuments([]);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handlePreviewFile = async (filename: string) => {
        if (!selectedUserId) return;
        const hide = message.loading(`Đang tải file ${filename}...`, 0);
        try {
            const blob = await authApi.getPreviewDocument(selectedUserId, filename);
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error("Lỗi preview file:", error);
            message.error("Có lỗi khi mở file. File có thể không tồn tại hoặc lỗi mạng.");
        } finally {
            hide();
        }
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
                    onViewDocuments={handleOpenDocuments}
                />
            </Layout.Content>

            <Modal
                title="Tài liệu đính kèm"
                open={isDocModalOpen}
                onCancel={() => setIsDocModalOpen(false)}
                footer={<Button onClick={() => setIsDocModalOpen(false)}>Đóng</Button>}
                destroyOnClose
            >
                {loadingDocs ? (
                    <Flex justify="center" style={{ padding: 24 }}>
                        <Spin tip="Đang tải danh sách tài liệu..." />
                    </Flex>
                ) : (
                    <List
                        dataSource={documents}
                        locale={{ emptyText: "Không có tài liệu nào được đính kèm." }}
                        renderItem={(filename) => (
                            <List.Item
                                actions={[
                                    <Button 
                                        type="primary" 
                                        icon={<EyeOutlined />} 
                                        size="small" 
                                        onClick={() => handlePreviewFile(filename)}
                                    >
                                        Xem trước
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                                    title={<Text strong>{filename}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
        </>
    );
}