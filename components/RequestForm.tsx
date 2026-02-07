
import React, { useState, useEffect } from 'react';
import { X, Save, Info, Building2, CheckCircle, AlertTriangle, MessageSquareQuote, Calendar } from 'lucide-react';
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
    correspondence: { status: RequestStatus.PENDING, bookNumber: '', bookDate: '' },
    financialSettlement: { status: RequestStatus.PENDING, bookNumber: '', bookDate: '' },
    cancellation: { status: RequestStatus.PENDING, bookNumber: '', bookDate: '' },
    notes: '',
    settlementDays: settings.defaultSettlementDays
  });

  const [formData, setFormData] = useState<VehicleRequest>(initialData || getDefaultState());

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData(getDefaultState());
    }
  }, [initialData, isOpen, companies, settings.defaultSettlementDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-end lg:items-center justify-center bg-black/60 backdrop-blur-md lg:p-4 animate-in fade-in duration-300">
      <div className={`relative w-full lg:max-w-4xl h-[92vh] lg:h-auto lg:max-h-[90vh] overflow-hidden rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl border animate-in slide-in-from-bottom-10 lg:slide-in-from-top-0 duration-300 ${settings.darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-white'}`}>
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-10 py-6 lg:py-8 border-b dark:border-gray-700 bg-inherit backdrop-blur-xl">
          <div className="text-right">
            <h2 className={`text-lg lg:text-3xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
              {initialData ? 'تحديث المعاملة' : 'تسجيل طلب جديد'}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">يرجى ملء كافة الحقول المطلوبة بدقة</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-10 text-right h-full overflow-y-auto pb-32 lg:pb-10" dir="rtl">
          <div className="space-y-8 lg:space-y-10">
            
            {/* Vehicle & Owner Info */}
            <div>
              <h3 className="text-sm font-black text-blue-600 mb-6 flex items-center gap-2 border-r-4 border-blue-600 pr-3">
                <Info size={16} /> البيانات الأساسية للمالك والمركبة
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
                  <input required type="text" className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    value={formData.applicantName} onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم اللوحة</label>
                  <input required type="text" className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">نوع الملكية</label>
                  <input required type="text" className={`w-full px-4 py-3.5 rounded-2xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                    value={formData.ownership} onChange={(e) => setFormData({ ...formData, ownership: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Company & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">الشركة المعتمدة</label>
                <select className={`w-full px-4 py-3.5 rounded-2xl border-2 font-bold text-sm outline-none transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                  value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}>
                  {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ استلام الطلب</label>
                <input type="date" className={`w-full px-4 py-3.5 rounded-2xl border-2 font-bold text-sm outline-none transition-all focus:border-blue-500 ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                  value={formData.requestDate} onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })} />
              </div>
            </div>

            {/* Path Steps */}
            <div>
              <h3 className="text-sm font-black text-primary mb-6 flex items-center gap-2 border-r-4 border-primary pr-3" style={{ borderColor: settings.primaryColor, color: settings.primaryColor }}>
                <CheckCircle size={16} /> المسار الإجرائي للمعاملة
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Step 1: Correspondence */}
                <div className={`p-6 rounded-[2rem] border-2 transition-all ${settings.darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-blue-50/40 border-blue-100'}`}>
                  <h3 className="text-xs font-black text-blue-700 mb-4">1. خطوة المفاتحة</h3>
                  <div className="space-y-4">
                    <select className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={formData.correspondence.status} onChange={(e) => setFormData({ ...formData, correspondence: { ...formData.correspondence, status: e.target.value as RequestStatus } })}>
                      <option value={RequestStatus.PENDING}>قيد المراجعة</option>
                      <option value={RequestStatus.DONE}>تم إرسال الكتاب</option>
                    </select>
                    {formData.correspondence.status === RequestStatus.DONE && (
                      <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                        <input type="text" placeholder="رقم كتاب المفاتحة" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                          value={formData.correspondence.bookNumber || ''} onChange={(e) => setFormData({ ...formData, correspondence: { ...formData.correspondence, bookNumber: e.target.value } })} />
                        <input type="date" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                          value={formData.correspondence.bookDate || ''} onChange={(e) => setFormData({ ...formData, correspondence: { ...formData.correspondence, bookDate: e.target.value } })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Financial Settlement */}
                <div className={`p-6 rounded-[2rem] border-2 transition-all ${settings.darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-green-50/40 border-green-100'}`}>
                  <h3 className="text-xs font-black text-green-700 mb-4">2. استيفاء الرسوم</h3>
                  <div className="space-y-4">
                    <select className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-green-500/20"
                      value={formData.financialSettlement.status} onChange={(e) => setFormData({ ...formData, financialSettlement: { ...formData.financialSettlement, status: e.target.value as RequestStatus } })}>
                      <option value={RequestStatus.PENDING}>بانتظار الدفع</option>
                      <option value={RequestStatus.DONE}>تم سداد الأجور</option>
                    </select>
                    {formData.financialSettlement.status === RequestStatus.DONE && (
                      <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                        <input type="text" placeholder="رقم وصل القبض" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                          value={formData.financialSettlement.bookNumber || ''} onChange={(e) => setFormData({ ...formData, financialSettlement: { ...formData.financialSettlement, bookNumber: e.target.value } })} />
                        <input type="date" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                          value={formData.financialSettlement.bookDate || ''} onChange={(e) => setFormData({ ...formData, financialSettlement: { ...formData.financialSettlement, bookDate: e.target.value } })} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Cancellation Final Step */}
                <div className={`p-6 rounded-[2rem] border-2 transition-all ${formData.cancellation.status === RequestStatus.STOPPED ? 'bg-red-50 border-red-200' : (settings.darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-purple-50/40 border-purple-100')}`}>
                  <h3 className={`text-xs font-black mb-4 ${formData.cancellation.status === RequestStatus.STOPPED ? 'text-red-700' : 'text-purple-700'}`}>3. القرار النهائي</h3>
                  <div className="space-y-4">
                    <select className={`w-full px-4 py-3 rounded-xl border text-xs font-bold outline-none focus:ring-2 dark:bg-gray-800 ${formData.cancellation.status === RequestStatus.STOPPED ? 'border-red-500 text-red-700 focus:ring-red-500/20' : 'dark:text-white focus:ring-purple-500/20'}`}
                      value={formData.cancellation.status} onChange={(e) => setFormData({ ...formData, cancellation: { ...formData.cancellation, status: e.target.value as RequestStatus } })}>
                      <option value={RequestStatus.PENDING}>قيد الإجراء</option>
                      <option value={RequestStatus.DONE}>تم الإلغاء كلياً</option>
                      <option value={RequestStatus.STOPPED}>إيقاف المعاملة</option>
                    </select>
                    {formData.cancellation.status === RequestStatus.DONE && (
                      <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                        <input type="text" placeholder="رقم كتاب الإلغاء" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                          value={formData.cancellation.bookNumber || ''} onChange={(e) => setFormData({ ...formData, cancellation: { ...formData.cancellation, bookNumber: e.target.value } })} />
                        <input type="date" className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none"
                          value={formData.cancellation.bookDate || ''} onChange={(e) => setFormData({ ...formData, cancellation: { ...formData.cancellation, bookDate: e.target.value } })} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Note Area */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">ملاحظات توضيحية إضافية</label>
              <textarea 
                placeholder="أضف أي تفاصيل أو مبررات إضافية للمتابعة هنا..."
                className={`w-full px-5 py-4 rounded-2xl border-2 outline-none font-bold text-sm min-h-[120px] focus:border-primary transition-all ${settings.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-100'}`}
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="fixed lg:static bottom-0 inset-x-0 p-6 lg:p-0 bg-white dark:bg-gray-900 lg:bg-transparent lg:mt-12 flex flex-col lg:flex-row justify-between items-stretch gap-4 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] lg:shadow-none">
             <button type="submit" className="w-full lg:w-auto px-12 py-4 rounded-2xl text-sm font-black bg-primary text-white shadow-xl shadow-blue-500/20 hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95"
               style={{ backgroundColor: settings.primaryColor }}>
              <Save size={20} /> حفظ واعتماد كافة البيانات
            </button>
             <button type="button" onClick={onClose} className="px-8 py-4 rounded-2xl text-sm font-black text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95">تجاهل التغييرات</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
