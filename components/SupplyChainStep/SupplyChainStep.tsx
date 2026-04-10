import {
    BuildOutlined,
    CarOutlined,
    InboxOutlined,
    ShopOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Flex, Typography } from "antd";

const { Text } = Typography;

const steps = [
    { key: "manufacture", label: "Sản xuất", icon: <BuildOutlined /> },
    { key: "transport", label: "Vận chuyển", icon: <CarOutlined /> },
    { key: "warehouse", label: "Lưu kho", icon: <InboxOutlined /> },
    { key: "pharmacy", label: "Nhà thuốc", icon: <ShopOutlined /> },
    { key: "consumer", label: "Người tiêu dùng", icon: <UserOutlined /> },
];

export default function SupplyChainStep({ 
    current = 0, 
    isRecalled = false 
}: { 
    current?: number; 
    isRecalled?: boolean 
}) {
    // Nếu lô thuốc bị thu hồi, hiển thị màu đỏ (volcano). Ngược lại hiển thị màu xanh lá (#00a870)
    const activeColor = isRecalled ? "#fa541c" : "#00a870";

    return (
        <Flex align="center" justify="space-between" style={{ width: "70%", margin: "24px 0" }}>
            {steps.map((step, index) => {
                // Logic tính toán trạng thái của bước
                const isCompleted = index < current;
                const isActive = index === current;
                
                // Trạng thái màu sắc
                const color = (isCompleted || isActive) ? activeColor : "#ccc";
                const lineColor = isCompleted ? activeColor : "#e8e8e8";

                return (
                    <Flex key={step.key} align="center" gap={12} style={{ flex: index !== steps.length - 1 ? 1 : 'none' }}>
                        <Flex vertical align="center" style={{ minWidth: 80 }}>
                            <div
                                style={{
                                    fontSize: isActive ? 32 : 28, // Bước hiện tại sẽ to hơn một chút
                                    color: color,
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {step.icon}
                            </div>

                            <Text
                                style={{
                                    marginTop: 8,
                                    color: color,
                                    fontWeight: isActive ? 600 : 400,
                                    transition: "all 0.3s ease"
                                }}
                            >
                                {step.label}
                            </Text>
                        </Flex>

                        {/* Đường kẻ nối giữa các bước */}
                        {index !== steps.length - 1 && (
                            <div
                                style={{
                                    flex: 1,
                                    margin: "0 8px",
                                    height: 0,
                                    borderTop: `2px ${isCompleted ? 'solid' : 'dashed'} ${lineColor}`,
                                    transition: "all 0.3s ease",
                                    transform: "translateY(-12px)" // Đẩy đường kẻ lên ngang tâm icon
                                }}
                            />
                        )}
                    </Flex>
                );
            })}
        </Flex>
    );
}