
export enum RequestStatus {
  PENDING = 'قيد الإجراء',
  PRINTED = 'تم طباعة الكتاب (قيد التوقيع)',
  DONE = 'تم',
  STOPPED = 'تم إيقاف المعاملة'
}

export interface AdministrativeStep {
  status: RequestStatus;
  bookNumber?: string;
  bookDate?: string;
  stopReason?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'editor' | 'viewer';
  addedDate: string;
}

export interface VehicleRequest {
  id: string;
  applicantName: string;
  requestDate: string;
  vehicleNumber: string;
  ownership: string;
  company: string;
  correspondence: AdministrativeStep;
  financialSettlement: AdministrativeStep;
  cancellation: AdministrativeStep;
  notes: string;
  settlementDays: number;
}

export type UIStyle = 'glass' | 'modern' | 'minimal';

export interface SystemSettings {
  departmentName: string;
  sectionName: string;
  branchName: string;
  defaultSettlementDays: number;
  primaryColor: string;
  uiStyle: UIStyle;
  fontSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
  logoUrl?: string;
  users: User[];
  notifications: {
    enableBrowser: boolean;
    notifyBeforeDays: number;
    notifyOnOverdue: boolean;
  };
  appearance: {
    sidebarStyle: 'full' | 'compact';
    borderRadius: 'none' | 'small' | 'large';
  };
}

export interface Company {
  id: string;
  name: string;
  addedDate: string;
}
