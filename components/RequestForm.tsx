
import React, { useState, useEffect } from 'react';
import { X, Save, Info, CheckCircle, Calendar, FileText, AlertOctagon } from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus, Company } from '../types';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VehicleRequest) => void;
  initialData?: VehicleRequest;
  settings: SystemSettings;
  companies: Company[];
}

const StepSection = ({ title, icon: Icon, color, stepKey, labelPrefix, formData, setFormData, darkMode, primaryColor }: any) => {
  const step = (formData as any)[stepKey];
  const isDone = step.status === RequestStatus.DONE;
  const isStopped = step.status === RequestStatus.STOPPED;

  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all duration-300 ${
      isStopped ? 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 
      darkMode ? 'bg-gray-800/40 border-gray-700' : `${color.bg} ${color.border}`
    }`}>
      <h4 className={`text-xs font-black flex items-center gap-2 mb-4 ${isStopped ? 'text-red-700' : color.text}`}>
        <Icon size={16} /> {title}
      </h4>
      <div className="space-y-4">
        <select 
          className={`w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-800 dark:text-white outline-none ${isStopped ? 'border-red-300' : ''}`}
          value={step.status}
          onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, status: e.target.value as RequestStatus } })}
        >
          <option value={RequestStatus.PENDING}>قيد المراجعة</option>
          <option value={RequestStatus.DONE}>تم الإنجاز</option>
          {stepKey === 'cancellation' && <option value={RequestStatus.STOPPED} className="text-red-600 font-bold">تم إيقاف المعاملة</option>}
        </select>
        
        {isDone && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder={`رقم ${labelPrefix}`}
              className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-900 dark:text-white outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor + '40' } as any}
              value={step.bookNumber || ''}
              onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, bookNumber: e.target.value } })}
            />
            <input 
              type="date"
              className="w-full px-4 py-3 rounded-xl border text-xs font-bold dark:bg-gray-900 dark:text-white outline-none focus:ring-2"
              style={{ '--tw-ring-color': primaryColor + '40' } as any}
              value={step.bookDate || ''}
              onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, bookDate: e.target.value } })}
            />
          </div>
        )}

        {isStopped && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase">
              <AlertOctagon size={12} /> بيان أسباب الإيقاف الإداري
            </div>
            <textarea 
              required
              placeholder="يرجى توضيح الأسباب الفنية أو الإدارية التي أدت لإيقاف هذه المعاملة..."
              className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white dark:bg-gray-900 dark:text-white text-xs font-bold outline-none min-h-[80px] focus:ring-2 ring-red-500/20"
              value={step.stopReason || ''}
              onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, stopReason: e.target.value } })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const RequestForm: React.FC<RequestFormProps> = ({ isOpen, onClose, onSave, initialData, settings, companies }) => {
  const getDefaultState = (): VehicleRequest => ({
    id: Math.random().toString(36).substr(2, 9),
    applicantName: '',
    requestDate: new Date().toISOString().split('T')[0],
    vehicleNumber: '',
    ownership: '',
    company: companies.length > 0 ? companies[0].name : '',
    correspondence: { status: RequestStatus.PENDING, bookNumber: '', bookDate: '' },
    financialSettlement: { status: RequestStatus.PENDING, bookNumber: '', bookDate: '' },
    cancellation: { status: RequestStatus.PENDING, bookNumber: '', bookDate: '', stopReason: '' },
    notes: '',
    settlementDays: settings.defaultSettlementDays
  });

  const [formData, setFormData] = useState<VehicleRequest>(getDefaultState());

  useEffect(() => {
    if (initialData) setFormData({ ...initialData });
    else setFormData(getDefaultState());
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.applicantName.trim() || !formData.vehicleNumber.trim()) {
      alert("يرجى إدخال اسم المالك ورقم المركبة");
      return;
    }
    
    // التحقق من وجود سبب الإيقاف إذا كانت المعاملة موقوفة
    if (formData.cancellation.status === RequestStatus.STOPPED && !formData.cancellation.stopReason?.trim()) {
      alert("يرجى تبرير سبب إيقاف المعاملة أولاً");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-end lg:items-center justify-center p-0 lg:p-4 animate-in fade-in">
      <div className={`w-full lg:max-w-4xl max-h-[92vh] lg:max-h-[90vh] overflow-hidden rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl flex flex-col ${settings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
        
        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
          <div className="text-right">
            <h2 className="text-2xl font-black dark:text-white">{initialData ? 'تعديل المعاملة' : 'تسجيل طلب جديد'}</h2>
            <p className="text-xs text-gray-400 font-bold">يرجى استيفاء كافة البيانات الرسمية</p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-red-500 transition-colors"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 rtl text-right">
          
          <div className="space-y-8">
            <h3 className="text-sm font-black text-blue-600 border-r-4 border-blue-600 pr-3 flex items-center gap-2"><Info size={16} /> البيانات التعريفية</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم المالك الرباعي</label>
                <input required type="text" className="w-full px-4 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all font-bold" value={formData.applicantName} onChange={e => setFormData({...formData, applicantName: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم اللوحة / الشاصي</label>
                <input required type="text" className="w-full px-4 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all font-bold" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عائدية المركبة</label>
                <input required type="text" className="w-full px-4 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all font-bold" value={formData.ownership} onChange={e => setFormData({...formData, ownership: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الشركة المعتمدة</label>
                <select className="w-full px-4 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none font-bold" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}>
                  {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ استلام الطلب</label>
                <input type="date" className="w-full px-4 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none font-bold" value={formData.requestDate} onChange={e => setFormData({...formData, requestDate: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-black text-primary border-r-4 pr-3 flex items-center gap-2" style={{borderColor: settings.primaryColor, color: settings.primaryColor}}><CheckCircle size={16} /> المسار الإجرائي</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StepSection 
                title="1. المفاتحة" 
                icon={FileText} 
                color={{bg:'bg-blue-50', border:'border-blue-100', text:'text-blue-700'}} 
                stepKey="correspondence" 
                labelPrefix="كتاب المفاتحة" 
                formData={formData}
                setFormData={setFormData}
                darkMode={settings.darkMode}
                primaryColor={settings.primaryColor}
              />
              <StepSection 
                title="2. استيفاء الرسوم" 
                icon={CheckCircle} 
                color={{bg:'bg-green-50', border:'border-green-100', text:'text-green-700'}} 
                stepKey="financialSettlement" 
                labelPrefix="وصل القبض" 
                formData={formData}
                setFormData={setFormData}
                darkMode={settings.darkMode}
                primaryColor={settings.primaryColor}
              />
              <StepSection 
                title="3. القرار النهائي" 
                icon={CheckCircle} 
                color={{bg:'bg-purple-50', border:'border-purple-100', text:'text-purple-700'}} 
                stepKey="cancellation" 
                labelPrefix="كتاب الإلغاء" 
                formData={formData}
                setFormData={setFormData}
                darkMode={settings.darkMode}
                primaryColor={settings.primaryColor}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ملاحظات فنية</label>
            <textarea className="w-full px-6 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white min-h-[120px] outline-none font-bold" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="سجل أي ملاحظات تخص ملف المعاملة..." />
          </div>

          <div className="flex flex-col lg:flex-row gap-4 pt-10">
            <button type="submit" className="flex-1 py-5 rounded-2xl bg-primary text-white font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3" style={{backgroundColor: settings.primaryColor}}>
              <Save size={20} /> حفظ واعتماد البيانات
            </button>
            <button type="button" onClick={onClose} className="px-10 py-5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold transition-all hover:bg-gray-200">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
