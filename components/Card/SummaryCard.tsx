import { Card, Flex } from "antd";
import { RightOutlined } from "@ant-design/icons";
import clsx from "clsx";

type SummaryCardProps = {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    footerText: string;
    color: "blue" | "red";
    onClick?: () => void;
};

export default function SummaryCard({
    icon,
    value,
    label,
    footerText,
    color,
    onClick,
}: SummaryCardProps) {
    return (
        <Card>
            <Flex vertical align="center" gap={8}>
                {icon}
                <div className="summary-value">{value}</div>
                <div className="summary-label">{label}</div>
            </Flex>

            <div className="summary-footer" onClick={onClick}>
                {footerText} <RightOutlined />
            </div>
        </Card>
    );
}
