
import { RequestStatus, VehicleRequest, SystemSettings, Company, User } from './types';

export const INITIAL_COMPANIES: Company[] = [
  { id: '1', name: 'شركة النور للسيارات', addedDate: '2024-01-01' },
  { id: '2', name: 'الشركة العامة لتجارة السيارات', addedDate: '2024-01-05' },
  { id: '3', name: 'شركة الخليج للسيارات', addedDate: '2024-02-10' },
  { id: '4', name: 'شركة النقل الوطنية', addedDate: '2024-03-15' }
];

export const INITIAL_SETTINGS: SystemSettings = {
  departmentName: 'وزارة النقل والمواصلات',
  sectionName: 'قسم شؤون المركبات',
  branchName: 'شعبة إلغاء الاعتمادية',
  defaultSettlementDays: 15,
  primaryColor: '#1e40af',
  uiStyle: 'modern',
  fontSize: 'medium',
  darkMode: false,
  logoUrl: undefined,
  users: [
    { id: 'u1', name: 'أحمد محمد', username: 'admin_1', role: 'admin', addedDate: '2024-01-01' },
    { id: 'u2', name: 'سارة علي', username: 'staff_1', role: 'editor', addedDate: '2024-02-15' }
  ],
  notifications: {
    enableBrowser: true,
    notifyBeforeDays: 3,
    notifyOnOverdue: true
  },
  appearance: {
    sidebarStyle: 'full',
    borderRadius: 'large'
  }
};

export const MOCK_REQUESTS: VehicleRequest[] = [
  {
    id: '1',
    applicantName: 'محمد أحمد العلي',
    requestDate: '2024-05-10',
    vehicleNumber: 'أ ب ج 1234',
    ownership: 'شخصي - ملك صرف',
    company: 'شركة النقل الوطنية',
    correspondence: {
      status: RequestStatus.DONE,
      bookNumber: 'م/123',
      bookDate: '2024-04-10'
    },
    financialSettlement: { status: RequestStatus.PENDING },
    cancellation: { status: RequestStatus.PENDING },
    notes: 'بانتظار الرسوم المالية',
    settlementDays: 15
  },
  {
    id: '2',
    applicantName: 'فاطمة حسن',
    requestDate: '2024-05-15',
    vehicleNumber: 'د هـ و 5678',
    ownership: 'عقد إيجار منتهي',
    company: 'شركة المركبات المتحدة',
    correspondence: {
      status: RequestStatus.DONE,
      bookNumber: 'س/998',
      bookDate: '2024-05-20'
    },
    financialSettlement: { status: RequestStatus.PENDING },
    cancellation: { status: RequestStatus.PENDING },
    notes: '',
    settlementDays: 15
  },
  {
    id: '3',
    applicantName: 'خالد عبدالله',
    requestDate: '2024-05-20',
    vehicleNumber: 'ز ح ط 9012',
    ownership: 'ملك صرف',
    company: 'شركة الخليج للسيارات',
    correspondence: {
      status: RequestStatus.DONE,
      bookNumber: 'ل/445',
      bookDate: '2024-05-22'
    },
    financialSettlement: {
      status: RequestStatus.DONE,
      bookNumber: 'ر/77',
      bookDate: '2024-05-23'
    },
    cancellation: {
      status: RequestStatus.DONE,
      bookNumber: 'ق/11',
      bookDate: '2024-05-25'
    },
    notes: 'تم الإنجاز بنجاح',
    settlementDays: 15
  }
];
