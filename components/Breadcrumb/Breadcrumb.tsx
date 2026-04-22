import { Breadcrumb as AntBreadcrumb, Grid } from "antd"; 
import { useLocation } from "react-router";
import { menuByRole } from "components/Sidebar/menu.config";
import type { UserRole } from "constants/type";
import { buildBreadcrumb } from "utils/breadcrum";
import styles from "./Breadcrumb.module.css";

const { useBreakpoint } = Grid; 

type Props = {
    role: UserRole;
};

export default function Breadcrumb({ role }: Props) {
    const location = useLocation(); 
    const originalItems = buildBreadcrumb(location.pathname, menuByRole[role]);
    
    const screens = useBreakpoint();
    const isMobile = screens.md === false; 

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

    let displayItems = items;
    if (isMobile && items.length > 0) {
        displayItems = [items[items.length - 1]]; 
    }

    return (
        <div 
            className={styles.breadcrumbLayout}
            style={isMobile ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : undefined}
        >
            <AntBreadcrumb items={displayItems} />
        </div>
    );
}