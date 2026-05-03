import { FilterOutlined, PlusOutlined, SearchOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, message, Modal, Spin, List, Typography } from "antd";
import EmployeeTable from "components/Table/EmployeeTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import { authApi, employeeApi } from "api/employeeApi";
import { useAuth } from "auth/useAuth";

const { Text } = Typography;

export default function PharmacyStaff() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth();

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [documents, setDocuments] = useState<string[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

    const handleOpenDocuments = async (userId: string) => {
        setIsDocModalOpen(true);
        setSelectedUserId(userId);
        setLoadingDocs(true);
        try {
            const res = await authApi.getDocuments(userId);
            let docList = Array.isArray(res) ? res : (res?.data || []);
            setDocuments(docList);
            
            if (docList.length === 0) {
                message.warning("Nhân viên này không có tài liệu đính kèm nào!");
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách file nhân viên:", error);
            message.error("Không thể tải hồ sơ của nhân viên!");
            setDocuments([]);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handlePreviewFile = async (filename: string) => {
        if (!selectedUserId) return;
        const hide = message.loading(`Đang mở file ${filename}...`, 0);
        try {
            const blob = await authApi.getPreviewDocument(selectedUserId, filename);
            const fileURL = URL.createObjectURL(blob);
            window.open(fileURL, '_blank');
        } catch (error) {
            message.error("Có lỗi khi mở file!");
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
                            placeholder="-- Chọn phòng ban --"
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
                    
                    onViewDocuments={handleOpenDocuments} 
                />
            </Layout.Content>

            <Modal
                title={`Hồ sơ đính kèm`}
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
                        locale={{ emptyText: "Không có hồ sơ đính kèm." }}
                        renderItem={(filename) => (
                            <List.Item
                                actions={[
                                    <Button 
                                        type="primary" 
                                        icon={<EyeOutlined />} 
                                        size="small" 
                                        onClick={() => handlePreviewFile(filename)}
                                    >
                                        Xem
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