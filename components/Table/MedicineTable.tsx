import { Table, Pagination, Flex, message, Form, Select, Modal } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getColumns } from "./MedicineColumn";
import { drugProfileApi } from "api/drugProfileApi";

interface MedicineTableProps {
    searchTerm: string;
    drugType: string | null;
}

export default function MedicineTable({ searchTerm, drugType }
    : MedicineTableProps
) {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [form] = Form.useForm();
    
    const navigate = useNavigate();
    const pageSize = 10;

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const result = await drugProfileApi.getAll({
                manufacturerOrgId: "ORG001",
                page: page,
                size: pageSize,
                drugType: drugType
            });
            
            setData(result.data || []);
            setTotal(result.total || 0);

        } catch (error) {
            console.error("Fetch error:", error);
            message.error("Có lỗi xảy ra khi lấy danh sách thuốc!");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEditModal = (record: any) => {
        setEditingRecord(record);
        form.setFieldsValue({ status: record.approveStatus });
        setIsModalOpen(true);
    };

    const handleUpdateStatus = async () => {
        try {
            const values = await form.validateFields();
            setConfirmLoading(true);
            await drugProfileApi.updateStatus(editingRecord.drugId, values.status);
            
            message.success("Cập nhật trạng thái thành công!");
            setIsModalOpen(false);
            fetchMedicines(); 
        } catch (error) {
            console.error(error);
            message.error("Lỗi khi cập nhật trạng thái!");
        } finally {
            setConfirmLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, [page, drugType, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [drugType, searchTerm]);

    console.log(data);
    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={getColumns(handleOpenEditModal)}
                    dataSource={data}
                    rowKey={(record) => record.drugId}
                    pagination={false}
                    bordered
                    scroll={{ y: '100%' }}
                    loading={loading}
                    onRow={(record) => ({
                        onClick: () => {
                            navigate(`${record.drugId}`, {
                                state: record
                            });
                        },
                        style: { cursor: "pointer" }
                    })}
                />
            </div>

            <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(newPage) => setPage(newPage)}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>

            <Modal
                title="Cập nhật trạng thái hồ sơ thuốc"
                open={isModalOpen}
                onOk={handleUpdateStatus}
                confirmLoading={confirmLoading}
                onCancel={() => setIsModalOpen(false)}
                okText="Lưu thay đổi"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item 
                        name="status" 
                        label="Trạng thái phê duyệt"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select size="large">
                            <Select.Option value="PENDING">Chờ duyệt (PENDING)</Select.Option>
                            <Select.Option value="APPROVED">Đã duyệt (APPROVED)</Select.Option>
                            <Select.Option value="REJECTED">Từ chối (REJECTED)</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Flex>
    );
}