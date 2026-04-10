import { Card, type CardProps} from "antd";
import React from "react";
import style from "./BorderCard.module.css";

export default function BorderCard({
    children,
    ...props
}: CardProps & { children: React.ReactNode }) {
    const { className, ...restProps } = props;
    return (
        <Card
            {...restProps}
            className={`${style.borderCard} ${className || ''}`}
        >
            {children}
        </Card>
    );
}
