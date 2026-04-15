import { Breadcrumb as AntBreadcrumb } from "antd";
import { useLocation } from "react-router"; // 🌟 Xóa useParams đi vì không cần nữa
import { menuByRole } from "components/Sidebar/menu.config";
import type { UserRole } from "constants/type";
import { buildBreadcrumb } from "utils/breadcrum";
import styles from "./Breadcrumb.module.css";

type Props = {
    role: UserRole;
};

export default function Breadcrumb({ role }: Props) {
    const location = useLocation(); 
    const originalItems = buildBreadcrumb(location.pathname, menuByRole[role]);

    const items = originalItems.map((item: any) => {
        const titleStr = String(item.title || item.label || "");
        
        const isID = titleStr.length > 25 && titleStr.includes("-");

        if (isID) {
            return {
                ...item,
                title: location.state?.companyName || "Chi tiết hồ sơ",
                label: location.state?.companyName || "Chi tiết hồ sơ"
            };
        }
        return item;
    });

    if (items.length === 0) return null;

    return (
        <div className={styles.breadcrumbLayout}>
            <AntBreadcrumb items={items} />
        </div>
    );
}