import { useState } from "react";
import { Button, Image, Modal, Flex, Descriptions, Typography, Tag } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

// Map trạng thái hộp thuốc để hiển thị màu sắc cho đẹp
const boxStatusMap: Record<string, { color: string; label: string }> = {
    PRODUCED: { color: "gold", label: "Đã sản xuất" },
    IN_TRANSIT: { color: "blue", label: "Đang vận chuyển" },
    IN_STORAGE: { color: "cyan", label: "Lưu kho" },
    SOLD: { color: "green", label: "Đã bán" },
    RECALLED: { color: "volcano", label: "Thu hồi" },
    RETURNED: { color: "purple", label: "Đã trả lại" },
};

export const QRCodeCell = ({
    batchId,
    boxId,
    baseUrl,
    drugName = "Đang cập nhật...", // Thêm prop này để truyền tên thuốc từ bảng vào
    status = "Không rõ"             // Thêm prop này để truyền trạng thái từ bảng vào
}: {
    batchId: string;
    boxId: string;
    baseUrl: string;
    drugName?: string;
    status?: string;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const objectPath = `qrcode/${batchId}/${boxId}.jpg`;
    const src = `${baseUrl}/files/preview?objectName=${objectPath}`;

    return (
        <>
            <Button
                type="dashed"
                icon={<QrcodeOutlined />}
                size="small"
                onClick={() => setIsModalOpen(true)}
            >
                QR Hộp
            </Button>

            <Modal
                title={<Title level={4} style={{ margin: 0, textAlign: 'center' }}>Thông tin Mã QR Hộp thuốc</Title>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={<Button type="primary" onClick={() => setIsModalOpen(false)}>Đóng</Button>}
                centered
                destroyOnClose
            >
                <Flex vertical align="center" gap="large" style={{ padding: '16px 0' }}>
                    <Image
                        width={220}
                        height={220}
                        src={src}
                        fallback="https://via.placeholder.com/220?text=No+QR+Code"
                        style={{ borderRadius: 12, border: '2px solid #1677ff', padding: 8 }}
                        preview={false} 
                    />
                    
                    <div style={{ width: '100%', backgroundColor: '#f0f5ff', padding: '16px 24px', borderRadius: 8, border: '1px solid #bae0ff' }}>
                        <Descriptions column={1} size="small" labelStyle={{ fontWeight: 600, width: '130px', color: '#595959' }}>
                            <Descriptions.Item label="Sản phẩm">
                                <Text strong style={{ fontSize: 16, color: '#1677ff' }}>{drugName}</Text>
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Mã lô">
                                <Text>{batchId}</Text>
                            </Descriptions.Item>

                            <Descriptions.Item label="Mã hộp">
                                <Text copyable style={{ fontSize: 15 }}>{boxId}</Text>
                            </Descriptions.Item>
                            
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={boxStatusMap[status]?.color || "default"}>
                                    {boxStatusMap[status]?.label || status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </div>
                </Flex>
            </Modal>
        </>
    );
};