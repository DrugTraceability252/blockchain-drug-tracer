import { Card, Flex } from "antd";
import { DoubleRightOutlined } from "@ant-design/icons";
import style from "./SummaryCard.module.css";

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
        <Card className={`${style.summaryCard} ${style[`${color}Border`]}`}>
            <Flex vertical align="center" style={{ padding: 8 }}>
                <div className={`${style.summaryIcon} ${style[color]}`}>{icon}</div>
                <div className={style.summaryValue}>{value}</div>
                <div className={style.summaryLabel}>{label}</div>
            </Flex>

            <Flex gap={8} className={`${style.summaryFooter} ${style[`${color}Background`]}`} onClick={onClick}>
                {footerText} 
                <DoubleRightOutlined/>
            </Flex>
        </Card>
    );
}
