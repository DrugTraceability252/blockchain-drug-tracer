export type UserRole =
  | "ADMIN"
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "REGULATOR";

export type Medicine = {
  key: string;
  name: string;
  id: string;
  category: string;
  stock: number;
};
