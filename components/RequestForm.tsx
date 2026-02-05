
import React, { useState, useEffect } from 'react';
import { X, Save, Info, Building2, CheckCircle, AlertTriangle, MessageSquareQuote } from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus, Company } from '../types';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VehicleRequest) => void;
  initialData?: VehicleRequest;
  settings: SystemSettings;
  companies: Company[];
}

const RequestForm: React.FC<RequestFormProps> = ({ isOpen, onClose, onSave, initialData, settings, companies }) => {
  const getDefaultState = () => ({
    id: '',
    applicantName: '',
    requestDate: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    ownership: '',
    company: companies.length > 0 ? companies[0].name : '',
    correspondence: { status: RequestStatus.PENDING },
    financialSettlement: { status: RequestStatus.PENDING },
    cancellation: { status: RequestStatus.PENDING },
    notes: '',
    settlementDays: settings.defaultSettlementDays
  });

  const [formData, setFormData] = useState<VehicleRequest>(initialData || getDefaultState());
  const [dueDate, setDueDate] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData(getDefaultState());
    }
  }, [initialData, isOpen, companies, settings.defaultSettlementDays]);

  useEffect(() => {
    if (formData.correspondence.status === RequestStatus.DONE && formData.correspondence.bookDate) {
      const date = new Date(formData.correspondence.bookDate);
      date.setDate(date.getDate() + formData.settlementDays);
      setDueDate(date.toLocaleDateString('ar-EG'));
    } else {
      setDueDate('');
    }
  }, [formData.correspondence, formData.settlementDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md lg:p-4 animate-in fade-in duration-300">
      <div className={`relative w-full lg:max-w-4xl h-full lg:h-auto lg:max-h-[90vh] overflow-y-auto lg:rounded-[2rem] shadow-2xl border animate-in zoom-in-95 duration-200 ${settings.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-10 py-6 lg:py-8 border-b dark:border-gray-700 bg-inherit backdrop-blur-xl">
          <h2 className={`text-xl lg:text-3xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
            {initialData ? 'تعديل المعاملة' : 'تسجيل طلب جديد'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 lg:p-10 text-right" dir="rtl">
          <div className="space-y-8 lg:space-y-10">
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-sm lg:text-base font-black text-blue-600 mb-6 flex items-center gap-3 border-r-4 border-blue-600 pr-4">
                <Info size={18} /> البيانات الأساسية للمركبة والمالك
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
                  <input required type="text" className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    value={formData.applicantName} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">رقم اللوحة / المركبة</label>
                  <input required type="text" className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">نوع العائدية</label>
                  <input required type="text" className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    value={formData.ownership} onChange={(e) => setFormData({ ...formData, ownership: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Section 2: Company & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">الشركة المعتمدة</label>
                <select className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-sm outline-none transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                  value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}>
                  {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">تاريخ استلام الطلب</label>
                <input type="date" className={`w-full px-4 py-3 rounded-xl border-2 font-bold text-sm outline-none transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                  value={formData.requestDate} onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })} />
              </div>
            </div>

            {/* Steps - Administrative Path */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {/* Step 1: Correspondence */}
              <div className={`p-6 rounded-[1.5rem] border-2 transition-all ${settings.darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-blue-50/30 border-blue-100'}`}>
                <h3 className="text-xs font-black text-blue-700 mb-5 flex items-center gap-2">خطوة المفاتحة</h3>
                <div className="space-y-4">
                  <select className="w-full px-4 py-3 rounded-xl border-2 text-xs font-bold outline-none dark:bg-gray-800 dark:text-white"
                    value={formData.correspondence.status} onChange={(e) => setFormData({ ...formData, correspondence: { ...formData.correspondence, status: e.target.value as RequestStatus } })}>
                    <option value={RequestStatus.PENDING}>قيد المراجعة</option>
                    <option value={RequestStatus.DONE}>تم إرسال الكتاب</option>
                  </select>
                  {formData.correspondence.status === RequestStatus.DONE && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input type="text" placeholder="رقم الكتاب الرسمي" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500"
                        value={formData.correspondence.bookNumber || ''} onChange={(e) => setFormData({ ...formData, correspondence: { ...formData.correspondence, bookNumber: e.target.value } })} />
                      <input type="date" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                        value={formData.correspondence.bookDate || ''} onChange={(e) => setFormData({ ...formData, correspondence: { ...formData.correspondence, bookDate: e.target.value } })} />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Financials */}
              <div className={`p-6 rounded-[1.5rem] border-2 transition-all ${settings.darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-green-50/30 border-green-100'}`}>
                <h3 className="text-xs font-black text-green-700 mb-5 flex items-center gap-2">استيفاء الرسوم</h3>
                <div className="space-y-4">
                  <select className="w-full px-4 py-3 rounded-xl border-2 text-xs font-bold outline-none dark:bg-gray-800 dark:text-white"
                    value={formData.financialSettlement.status} onChange={(e) => setFormData({ ...formData, financialSettlement: { ...formData.financialSettlement, status: e.target.value as RequestStatus } })}>
                    <option value={RequestStatus.PENDING}>بانتظار الدفع</option>
                    <option value={RequestStatus.DONE}>تم سداد الأجور</option>
                  </select>
                  {formData.financialSettlement.status === RequestStatus.DONE && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input type="text" placeholder="رقم الوصل المالي" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500"
                        value={formData.financialSettlement.bookNumber || ''} onChange={(e) => setFormData({ ...formData, financialSettlement: { ...formData.financialSettlement, bookNumber: e.target.value } })} />
                      <input type="date" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                        value={formData.financialSettlement.bookDate || ''} onChange={(e) => setFormData({ ...formData, financialSettlement: { ...formData.financialSettlement, bookDate: e.target.value } })} />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Final Decision */}
              <div className={`p-6 rounded-[1.5rem] border-2 transition-all ${formData.cancellation.status === RequestStatus.STOPPED ? 'bg-red-50/50 border-red-300' : (settings.darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-purple-50/30 border-purple-100')}`}>
                <h3 className={`text-xs font-black mb-5 ${formData.cancellation.status === RequestStatus.STOPPED ? 'text-red-700' : 'text-purple-700'}`}>قرار الإلغاء</h3>
                <div className="space-y-4">
                  <select className={`w-full px-4 py-3 rounded-xl border-2 text-xs font-bold outline-none dark:bg-gray-800 ${formData.cancellation.status === RequestStatus.STOPPED ? 'border-red-500 text-red-700 bg-white' : 'dark:text-white'}`}
                    value={formData.cancellation.status} onChange={(e) => setFormData({ ...formData, cancellation: { ...formData.cancellation, status: e.target.value as RequestStatus } })}>
                    <option value={RequestStatus.PENDING}>قيد الإجراء</option>
                    <option value={RequestStatus.DONE}>تم الإلغاء كلياً</option>
                    <option value={RequestStatus.STOPPED}>إيقاف المعاملة 🛑</option>
                  </select>
                  {formData.cancellation.status === RequestStatus.DONE && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <input type="text" placeholder="رقم الأمر الإداري" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500"
                        value={formData.cancellation.bookNumber || ''} onChange={(e) => setFormData({ ...formData, cancellation: { ...formData.cancellation, bookNumber: e.target.value } })} />
                      <input type="date" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                        value={formData.cancellation.bookDate || ''} onChange={(e) => setFormData({ ...formData, cancellation: { ...formData.cancellation, bookDate: e.target.value } })} />
                    </div>
                  )}
                  {formData.cancellation.status === RequestStatus.STOPPED && (
                    <textarea required placeholder="يرجى توضيح سبب إيقاف المعاملة..." className="w-full px-4 py-3 rounded-xl border-2 border-red-300 text-xs font-bold min-h-[100px] outline-none"
                      value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  )}
                </div>
              </div>
            </div>

            {/* General Notes */}
            {formData.cancellation.status !== RequestStatus.STOPPED && (
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">ملاحظات عامة</label>
                <textarea 
                  placeholder="أي معلومات إضافية تخص المعاملة..."
                  className={`w-full px-6 py-4 rounded-2xl border-2 outline-none font-bold text-sm min-h-[100px] focus:border-primary transition-all ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                />
              </div>
            )}
          </div>

          <div className="mt-10 lg:mt-12 pt-6 lg:pt-8 border-t dark:border-gray-700 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
             <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95">تجاهل التغييرات</button>
             <button type="submit" className="px-10 py-4 rounded-2xl text-sm font-black bg-primary text-white shadow-xl shadow-blue-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95"
               style={{ backgroundColor: settings.primaryColor }}>
              <Save size={20} /> حفظ واعتماد المعاملة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
