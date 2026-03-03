// constants/MockEmployeeData.ts

export type EmployeeStatus = "active" | "inactive";

export interface EmployeeData {
    key: string;
    employeeCode: string;
    fullName: string;
    position: string;
    status: EmployeeStatus;
}

export const MockEmployeeData: EmployeeData[] = [
    {
        key: "1",
        employeeCode: "NVID1873695867",
        fullName: "Nguyễn Văn An",
        position: "Nhân viên kho bãi",
        status: "active",
    },
    {
        key: "2",
        employeeCode: "NVID1873697574",
        fullName: "Trần Văn Bảo",
        position: "Nhân viên kho bãi",
        status: "active",
    },
    {
        key: "3",
        employeeCode: "NVID1877479202",
        fullName: "Lê Văn Chung",
        position: "Nhân viên sản xuất",
        status: "active",
    },
    {
        key: "4",
        employeeCode: "NVID1873698875",
        fullName: "Nguyễn Văn Dũng",
        position: "Nhân viên sản xuất",
        status: "active",
    },
    {
        key: "5",
        employeeCode: "NVID18736452712",
        fullName: "Nguyễn Văn Đạt",
        position: "Nhân viên sản xuất",
        status: "active",
    },
    {
        key: "6",
        employeeCode: "NVID18574727261",
        fullName: "Nguyễn Thị Giang",
        position: "Nhân viên sản xuất",
        status: "active",
    },
    {
        key: "7",
        employeeCode: "NVID1873656432",
        fullName: "Nguyễn Thị Hà",
        position: "Nhân viên sản xuất",
        status: "inactive",
    },
    {
        key: "8",
        employeeCode: "NVID1873623789",
        fullName: "Trần Văn Khoa",
        position: "Nhân viên kho bãi",
        status: "inactive",
    },
];