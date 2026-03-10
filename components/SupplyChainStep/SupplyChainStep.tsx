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

export default function SupplyChainStep({current = 1,}: {current?: number;}) {
    return (
        <Flex align="center" justify="space-between" style={{ width: "70%" }}>
        {steps.map((step, index) => {
            const active = index === current;

            return (
            <Flex key={step.key} align="center" gap={12}>
                <Flex vertical align="center">
                <div
                    style={{
                    fontSize: 28,
                    color: active ? "#00a870" : "#999",
                    }}
                >
                    {step.icon}
                </div>

                <Text
                    style={{
                    marginTop: 6,
                    color: active ? "#00a870" : "#999",
                    fontWeight: active ? 600 : 400,
                    }}
                >
                    {step.label}
                </Text>
                </Flex>

                {index !== steps.length - 1 && (
                <div
                    style={{
                    width: 80,
                    borderTop: "2px dashed #bbb",
                    }}
                />
                )}
            </Flex>
            );
        })}
        </Flex>
    );
}