import { FilterOutlined, InboxOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, Layout, Modal, Form, message } from "antd";
import BatchTable from "components/Table/BatchTable";
import { useHeaderActions } from "contexts/HeaderActionsContext";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "auth/useAuth";
import { drugBatchApi } from "api/drugBatchApi";
import { drugProfileApi } from "api/drugProfileApi";
import { organizationApi } from "api/organizationApi";

export default function DistributorWarehouseBatch() {
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth(); 
    
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 100;

    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [receiveForm] = Form.useForm();
    const [receiving, setReceiving] = useState(false);

    const fetchBatches = useCallback(async () => {
        if (!user?.facilityId) {
            console.log("⏳ Chờ hệ thống load thông tin Facility ID...");
            return; 
        }

        console.log("🚀 1. BẮT ĐẦU GỌI API VỚI KHO:", user.facilityId);
        setLoading(true);
        try {
            const params = {
                page: page,
                size: pageSize,  
            };
            console.log("📦 2. PARAMS GỬI ĐI:", params);

            const result = await drugBatchApi.getAll(params);
            console.log("📥 3. DỮ LIỆU BACKEND TRẢ VỀ CHƯA QUA XỬ LÝ:", result);
            
            const rawBatches = result?.data || result?.content || result || [];
            console.log("📋 4. SỐ LƯỢNG LÔ THUỐC TÌM ĐƯỢC:", rawBatches.length);

            if (rawBatches.length === 0) {
                console.log("⚠️ 5. KHO TRỐNG! KẾT THÚC HÀM.");
                setBatches([]);
                setTotal(0);
                return;
            }

            const enrichedBatches = await Promise.all(
                rawBatches.map(async (batch: any) => {
                    let dName = batch.drugId;
                    let fName = batch.manufacturerFacilityId;
                    
                    try {
                        if (batch.drugId) {
                            const profile = await drugProfileApi.getById(batch.drugId);
                            dName = profile?.data?.drugName || profile?.drugName || batch.drugId;
                        }
                    } catch (e) { console.error("Lỗi lấy tên thuốc:", e); }

                    try {
                        if (batch.manufacturerOrgId && batch.manufacturerFacilityId) {
                             const facRes = await organizationApi.getFacilities(batch.manufacturerOrgId);
                             const facilities = facRes?.data || facRes || [];
                             const found = facilities.find((f: any) => (f.id || f.facilityId) === batch.manufacturerFacilityId);
                             fName = found ? found.facilityName : batch.manufacturerFacilityId;
                        }
                    } catch (e) { console.error("Lỗi lấy tên cơ sở:", e); }

                    return { ...batch, drugName: dName, facilityName: fName };
                })
            );

            setBatches(enrichedBatches);
            setTotal(result.total || result.totalElements || enrichedBatches.length);
            
        } catch (error) {
            console.error("❌ LỖI CRASH KHI GỌI API:", error);
            message.error("Có lỗi xảy ra khi tải danh sách lô thuốc!");
        } finally {
            setLoading(false);
            console.log("✅ 6. ĐÃ TẮT VÒNG XOAY LOADING.");
        }
    }, [user?.facilityId, statusFilter, page, pageSize, searchTerm]);

    useEffect(() => {
        fetchBatches();
    }, [fetchBatches]);


    const handleReceiveSubmit = async (values: any) => {
        setReceiving(true);
        try {
            const batchId = values.batchId.trim();

            const historyResult = await drugBatchApi.getTransportHistory(batchId);
            const historyData = historyResult.data || historyResult || [];

            if (historyData.length === 0) {
                message.error("Lô thuốc này chưa có lịch sử vận chuyển nào!");
                setReceiving(false);
                return;
            }

            const sortedHistory = [...historyData].sort((a: any, b: any) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

            const shippedTx = sortedHistory.find((tx: any) => tx.data && tx.data.status === "SHIPPED");

            if (!shippedTx || !shippedTx.data.eventId) {
                message.error("Không tìm thấy trạng thái Đang giao (SHIPPED) để nhận hàng!");
                setReceiving(false);
                return;
            }

            const eventId = shippedTx.data.eventId;

            await drugBatchApi.receive(eventId);
            
            message.success(`Nhập kho thành công! Đã chốt mã vận chuyển: ${eventId}`);
            setIsReceiveModalOpen(false);
            receiveForm.resetFields();
            
            // Đợi 1 giây để Blockchain kịp cập nhật rồi mới kéo lại danh sách
            setTimeout(() => fetchBatches(), 1000);
            
        } catch (error) {
            console.error(error);
            message.error("Lỗi nhập kho! Lô thuốc có thể chưa được giao hoặc bạn không có quyền.");
        } finally {
            setReceiving(false);
        }
    };

    useEffect(() => {
        setHeaderActions(
            <Flex justify='center' align='center' gap='small'>
                <Button 
                    type="primary" 
                    icon={<InboxOutlined />} 
                    size="large"
                    onClick={() => setIsReceiveModalOpen(true)}
                >
                    Nhập kho
                </Button>
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
                            placeholder="Tìm kiếm mã lô thuốc..."
                            size="large"
                            suffix={<SearchOutlined />}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1); 
                            }}
                            allowClear
                        />
                    </Flex>
                    <Flex flex={1} justify='space-between' align='center' gap='small'>
                        <Flex flex={1} justify='flex-end'>
                            <Button icon={<FilterOutlined />} size="large" type='text' />
                        </Flex>
                        <Flex flex={1}>
                            <Cascader
                                placeholder="-- Trạng thái kho --"
                                size="large"
                                style={{ width: "100%" }}
                                options={[
                                    { value: 'IN_TRANSIT', label: 'Đang vận chuyển đến' },
                                    { value: 'STORED', label: 'Đang lưu kho' },
                                    { value: 'DISTRIBUTED', label: 'Đã phân phối đi' }
                                ]}
                                onChange={(val) => {
                                    setStatusFilter(val ? val[0] as string : null);
                                    setPage(1);
                                }}
                                changeOnSelect
                            />
                        </Flex>
                    </Flex>
                </Flex>
            </Layout.Header>
            <Layout.Content className="contentLayoutTableLevel">
                <BatchTable 
                    dataSource={batches}
                    loading={loading}
                    pagination={{ current: page, pageSize: pageSize }}
                    total={total}
                    onPageChange={(newPage: number) => setPage(newPage)}
                />
            </Layout.Content>

            <Modal
                title="Nhập kho Lô thuốc"
                open={isReceiveModalOpen}
                onCancel={() => {
                    setIsReceiveModalOpen(false);
                    receiveForm.resetFields();
                }}
                onOk={() => receiveForm.submit()}
                confirmLoading={receiving}
                okText="Xác nhận Nhập kho"
                cancelText="Hủy bỏ"
                okButtonProps={{ style: { backgroundColor: '#52c41a' } }}
            >
                <div style={{ marginBottom: 16 }}>
                    <p>Vui lòng nhập <b>Mã Lô thuốc (Batch ID)</b>. Hệ thống sẽ tự động quét lịch sử và xác nhận nhập kho lô hàng này.</p>
                </div>
                
                <Form form={receiveForm} layout="vertical" onFinish={handleReceiveSubmit}>
                    <Form.Item 
                        name="batchId" 
                        label="Mã Lô thuốc (Batch ID)" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập Mã Lô thuốc!' },
                            { whitespace: true, message: 'Mã Lô không được để trống!' }
                        ]}
                    >
                        <Input size="large" placeholder="Nhập hoặc dán mã Lô thuốc vào đây..." />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}