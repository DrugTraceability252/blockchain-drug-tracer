import { Table, Tag } from 'antd';
import { Link } from 'react-router'; 

const statusMap: Record<string, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: "Đang hoạt động" },
    INACTIVE: { color: "default", label: "Ngừng hoạt động" },
    SUSPENDED: { color: "red", label: "Bị đình chỉ" },
    PENDING: { color: "orange", label: "Chờ duyệt" }
};

const orgTypeMap: Record<string, { color: string; label: string }> = {
    MANUFACTURER: { color: "gold", label: "Nhà sản xuất" },
    DISTRIBUTOR: { color: "blue", label: "Nhà phân phối" },
    PHARMACY: { color: "cyan", label: "Nhà thuốc / Bán lẻ" },
    HOSPITAL: { color: "green", label: "Bệnh viện" },
    REGULATOR: { color: "purple", label: "Cơ quan Quản lý" }
};

export default function CompanyTable({ dataSource, loading, pagination, onChange }: any) {
    const columns = [
        { title: 'Tên tổ chức', dataIndex: 'orgName', key: 'orgName' },
        { title: 'Mã số thuế', dataIndex: 'taxCode', key: 'taxCode' },
        { title: 'Số giấy phép', dataIndex: 'licenseNumber', key: 'licenseNumber' },
        { 
            title: 'Loại hình', 
            dataIndex: 'orgType', 
            key: 'orgType',
            render: (type: string) => {
                const config = orgTypeMap[type] || { color: 'default', label: type };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        { title: 'Điện thoại', dataIndex: 'contactPhone', key: 'contactPhone' },
        
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config = statusMap[status] || { color: "default", label: status || "Không rõ" };
                return <Tag color={config.color} style={{ borderRadius: '4px' }}>{config.label}</Tag>;
            }
        },

        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                // Lấy orgId để nối vào URL. Bạn đảm bảo Route của trang chi tiết là /regulator/companies/:id nhé
                <Link to={`/regulator/company/${record.orgId}`} style={{ color: '#1890ff', fontWeight: 500 }}>
                    Xem chi tiết »
                </Link>
            )
        }
    ];

    return (
        <Table 
            columns={columns} 
            dataSource={dataSource} 
            loading={loading}
            pagination={pagination}
            onChange={onChange}
            rowKey="orgId"
        />
    );
}