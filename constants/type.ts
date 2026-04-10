export type UserRole =
  | "ADMIN"
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "REGULATOR";

export type Medicine = {
  drugId: string;             // Mã thuốc (Khóa chính)
  drugName: string;           // Tên thuốc
  manufacturerOrgId: string;  // Mã tổ chức sản xuất
  licenseNumber: string;      // Số đăng ký lưu hành
  licenseExpiry: string;      // Ngày hết hạn đăng ký (định dạng chuỗi ISO)
  decisionNumber: string;     // Số quyết định
  approvalYear: number;       // Năm phê duyệt
  approvalBatch: string;      // Đợt phê duyệt
  ingredient: string;         // Thành phần
  strength: string;           // Hàm lượng
  drugType: string;           // Loại thuốc (OTC, PRESCRIPTION, VACCINE...)
  dosageForm: string;         // Dạng bào chế (TABLET, CAPSULE...)
  packaging: string;          // Quy cách đóng gói
  qualityStandard: string;    // Tiêu chuẩn chất lượng
  shelfLife: string;          // Hạn sử dụng (VD: "36 tháng")
  approveStatus: string;      // Trạng thái phê duyệt (PENDING, APPROVED, REJECTED)
  documentHashes?: string[];  // Mảng các mã băm tài liệu đính kèm (có thể có hoặc không)
};
