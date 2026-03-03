import { Card, Flex } from "antd";
import { DoubleRightOutlined} from "@ant-design/icons";
import style from "./StatCard.module.css";

type StatItem = {
    value: number | string;
    label: string;
};

type StatCardProps = {
    title: string;
    items: StatItem[];
    extra?: React.ReactNode;
    onDetail?: () => void;
};

export default function StatCard({
    title,
    items,
    onDetail,
}: StatCardProps) {
    return (
        <Card
            title={title}
            extra={
                <span onClick={onDetail} style={{ cursor: "pointer" }}>
                Xem chi tiết <DoubleRightOutlined />
                </span>
            }
            className={style.statCard}
        >
            <Flex justify="space-between" style={{ padding: "16px 24px" }}>
                {items.map((item, idx) => (
                <div key={idx}>
                    <div className={style.statValue}>{item.value}</div>
                    <div className={style.statLabel}>{item.label}</div>
                </div>
                ))}
            </Flex>
        </Card>
    );
}
