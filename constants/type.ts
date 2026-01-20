export type UserRole =
  | "ADMIN"
  | "MANUFACTURER"
  | "DISTRIBUTOR";

export type Medicine = {
  key: string;
  name: string;
  id: string;
  category: string;
  stock: number;
};
