import { Input, Layout } from "antd";
import styles from './Header.module.css';
import { SearchOutlined } from "@ant-design/icons";

const { Header: AntdHeader } = Layout;

export default function Header() {
    return (
        <AntdHeader className={styles.headerLayout}>
            <Input
                placeholder="Tìm kiếm"
                size="large"
                className={styles.headerSearch}
                suffix={<SearchOutlined />}
            />
        </AntdHeader>
    );
}