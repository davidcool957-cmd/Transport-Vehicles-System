
import React, { useState, useEffect } from 'react';
import { X, Save, Info, CheckCircle, Calendar, FileText, AlertOctagon, ClipboardCheck, Plus, PenTool } from 'lucide-react';
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
  const isPrinted = step.status === RequestStatus.PRINTED;
  const isStopped = step.status === RequestStatus.STOPPED;

  return (
    <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 shadow-sm ${
      isStopped ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-800' : 
      isDone ? 'bg-green-50 border-green-500 dark:bg-green-900/30 dark:border-green-700 ring-4 ring-green-500/5' :
      isPrinted ? 'bg-sky-50 border-sky-400 dark:bg-sky-900/20 dark:border-sky-800 ring-4 ring-sky-500/5' :
      darkMode ? 'bg-gray-800/40 border-gray-700 text-gray-300' : `${color.bg} ${color.border} ${color.text}`
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-xs font-black flex items-center gap-2 ${
          isStopped ? 'text-red-700' : 
          isDone ? 'text-green-700 dark:text-green-400' : 
          isPrinted ? 'text-sky-700 dark:text-sky-400' : color.text
        }`}>
          {isPrinted ? <PenTool size={16} /> : <Icon size={16} />} {title}
        </h4>
        {isDone && <CheckCircle size={18} className="text-green-600 animate-in zoom-in" />}
        {isPrinted && <PenTool size={18} className="text-sky-600 animate-pulse" />}
      </div>

      <div className="space-y-4">
        <div className="relative">
          <select 
            className={`w-full px-4 py-3.5 rounded-xl border-2 text-xs font-black appearance-none outline-none transition-all ${
              isStopped ? 'border-red-400 text-red-700 bg-white' : 
              isDone ? 'border-green-600 text-green-800 bg-white shadow-md' : 
              isPrinted ? 'border-sky-500 text-sky-800 bg-white shadow-md' :
              'border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
            }`}
            value={step.status}
            onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, status: e.target.value as RequestStatus } })}
          >
            <option value={RequestStatus.PENDING}>قيد الإجراء</option>
            <option value={RequestStatus.PRINTED} className="text-sky-600 font-black">تم طباعة الكتاب (قيد التوقيع) ✍️</option>
            <option value={RequestStatus.DONE} className="text-green-700 font-black">(تم) الانجاز ✅</option>
            {stepKey === 'cancellation' && <option value={RequestStatus.STOPPED} className="text-red-600 font-bold">تم إيقاف المعاملة ⛔</option>}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 font-black">▼</div>
        </div>
        
        {isDone && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-white/60 dark:bg-black/20 p-4 rounded-2xl border border-green-200 dark:border-green-800/40">
            <div className="flex items-center gap-2 text-[10px] font-black text-green-700 uppercase">
              <ClipboardCheck size={12} /> توثيق بيانات (تم)
            </div>
            <div className="space-y-2">
              <div className="relative">
                <FileText size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                <input 
                  type="text" 
                  placeholder={`رقم ${labelPrefix}`}
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-green-200 text-xs font-bold dark:bg-gray-900 dark:text-white outline-none focus:border-green-600 transition-colors"
                  value={step.bookNumber || ''}
                  onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, bookNumber: e.target.value } })}
                />
              </div>
              <div className="relative">
                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                <input 
                  type="date"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-green-200 text-xs font-bold dark:bg-gray-900 dark:text-white outline-none focus:border-green-600 transition-colors"
                  value={step.bookDate || ''}
                  onChange={(e) => setFormData({ ...formData, [stepKey]: { ...step, bookDate: e.target.value } })}
                />
              </div>
            </div>
          </div>
        )}

        {isStopped && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-[10px] font-black text-red-600 uppercase">
              <AlertOctagon size={12} /> بيان أسباب الإيقاف
            </div>
            <textarea 
              required
              placeholder="يرجى كتابة أسباب إيقاف المعاملة بالتفصيل..."
              className="w-full px-4 py-3 rounded-xl border-2 border-red-300 bg-white dark:bg-gray-900 dark:text-white text-xs font-bold outline-none min-h-[100px] focus:border-red-600 transition-colors"
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
    
    if (formData.cancellation.status === RequestStatus.STOPPED && !formData.cancellation.stopReason?.trim()) {
      alert("يرجى تبرير سبب إيقاف المعاملة أولاً");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black/70 backdrop-blur-md flex items-end lg:items-center justify-center p-0 lg:p-4 animate-in fade-in duration-300">
      <div className={`w-full lg:max-w-5xl max-h-[95vh] lg:max-h-[90vh] overflow-hidden rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl flex flex-col ${settings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white'}`}>
        
        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between shrink-0 no-print">
          <div className="text-right flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary" style={{ color: settings.primaryColor }}>
                <Plus size={24} />
             </div>
             <div>
                <h2 className="text-2xl font-black dark:text-white">{initialData ? 'تعديل المعاملة' : 'تسجيل طلب جديد'}</h2>
                <p className="text-xs text-gray-400 font-bold">نظام الإدارة الإلكتروني - المسار الإجرائي</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-400 hover:text-red-500 transition-all active:scale-90"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 rtl text-right">
          
          <div className="space-y-8">
            <h3 className="text-sm font-black text-blue-600 border-r-4 border-blue-600 pr-3 flex items-center gap-2"><Info size={16} /> البيانات التعريفية للمالك</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم المالك الرباعي</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all font-bold shadow-sm" value={formData.applicantName} onChange={e => setFormData({...formData, applicantName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم اللوحة / الشاصي</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all font-bold shadow-sm" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عائدية المركبة</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none focus:border-blue-500 transition-all font-bold shadow-sm" value={formData.ownership} onChange={e => setFormData({...formData, ownership: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الشركة المعتمدة</label>
                <select className="w-full px-5 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none font-bold shadow-sm cursor-pointer" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}>
                  {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ استلام الطلب</label>
                <input type="date" className="w-full px-5 py-4 rounded-2xl border-2 dark:bg-gray-800 dark:text-white outline-none font-bold shadow-sm" value={formData.requestDate} onChange={e => setFormData({...formData, requestDate: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-sm font-black text-primary border-r-4 pr-3 flex items-center gap-2" style={{borderColor: settings.primaryColor, color: settings.primaryColor}}><CheckCircle size={16} /> المسار الإجرائي والمعالجة</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StepSection 
                title="1. خطوة المفاتحة" 
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
                icon={ClipboardCheck} 
                color={{bg:'bg-amber-50', border:'border-amber-100', text:'text-amber-700'}} 
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

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ملاحظات إضافية</label>
            <textarea className="w-full px-6 py-5 rounded-3xl border-2 dark:bg-gray-800 dark:text-white min-h-[140px] outline-none font-bold shadow-inner" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="اكتب هنا أي ملاحظات فنية أو إدارية تخص المعاملة..." />
          </div>

          <div className="flex flex-col lg:flex-row gap-5 pt-10 no-print">
            <button type="submit" className="flex-1 py-5 rounded-[2rem] bg-primary text-white font-black shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg" style={{backgroundColor: settings.primaryColor}}>
              <Save size={24} /> حفظ واعتماد البيانات
            </button>
            <button type="button" onClick={onClose} className="px-12 py-5 rounded-[2rem] bg-gray-100 dark:bg-gray-800 text-gray-500 font-black transition-all hover:bg-gray-200 dark:hover:bg-gray-700">تراجع</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;
