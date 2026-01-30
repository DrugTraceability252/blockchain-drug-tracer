import { Card, Flex } from "antd";
import { RightOutlined } from "@ant-design/icons";

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
    extra,
    onDetail,
}: StatCardProps) {
    return (
        <Card
            title={title}
            extra={
                <span onClick={onDetail} style={{ cursor: "pointer" }}>
                Xem chi tiết <RightOutlined />
                </span>
            }
        >
            <Flex justify="space-between">
                {items.map((item, idx) => (
                <div key={idx}>
                    <div className="stat-value">{item.value}</div>
                    <div className="stat-label">{item.label}</div>
                </div>
                ))}
            </Flex>
        </Card>
    );
}
