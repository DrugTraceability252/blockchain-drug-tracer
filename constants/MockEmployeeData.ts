// constants/MockEmployeeData.ts

export type EmployeeStatus = "active" | "inactive";

export interface EmployeeAttributes {
  identityNumber?: string[];
  phone?: string[];
  avatarUrl?: string[];
  group?: string[];
}

export interface EmployeeData {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  attributes?: EmployeeAttributes;
  enabled: boolean;

}
