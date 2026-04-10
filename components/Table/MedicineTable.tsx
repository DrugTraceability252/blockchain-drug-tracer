import { Table, Pagination, Flex, message } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { columns } from "./MedicineColumn";
import { drugProfileApi } from "api/drugProfileApi";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface MedicineTableProps {
    searchTerm: string;
    drugType: string | null;
}

export default function MedicineTable({ searchTerm, drugType }
    : MedicineTableProps
) {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const pageSize = 10;

    const fetchMedicines = async () => {
        setLoading(true);
        try {
            const result = await drugProfileApi.getAll({
                manufacturerOrgId: "ORG001",
                page: page,
                size: pageSize,
                drugType: drugType
            });
            
            setData(result.data || []);
            setTotal(result.total || 0);

        } catch (error) {
            console.error("Fetch error:", error);
            message.error("Có lỗi xảy ra khi lấy danh sách thuốc!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, [page, drugType, searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [drugType, searchTerm]);

    console.log(data);
    return (
        <Flex vertical style={{ height: "100%" }}>
            <div style={{ flex: 1, overflow: "hidden" }}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={(record) => record.drugId}
                    pagination={false}
                    bordered
                    scroll={{ y: '100%' }}
                    loading={loading}
                    onRow={(record) => ({
                        onClick: () => {
                            navigate(`${record.drugId}`, {
                                state: record
                            });
                        },
                        style: { cursor: "pointer" }
                    })}
                />
            </div>

            <Flex justify="end" style={{ padding: "12px 16px" }}>
                <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    onChange={(newPage) => setPage(newPage)}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </Flex>
        </Flex>
    );
}