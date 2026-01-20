import { Breadcrumb as AntBreadcrumb } from "antd";
import { useLocation } from "react-router";
import { menuByRole } from "components/Sidebar/menu.config";
import type { UserRole } from "constants/type";
import { buildBreadcrumb } from "utils/breadcrum";
import styles from "./Breadcrumb.module.css";

type Props = {
    role: UserRole;
};

export default function Breadcrumb({ role }: Props) {
    const { pathname } = useLocation();

    const items = buildBreadcrumb(pathname, menuByRole[role]);

    if (items.length === 0) return null;

    return (
        <div className={styles.breadcrumbLayout}>
            <AntBreadcrumb items={items} />
        </div>
    );
}
