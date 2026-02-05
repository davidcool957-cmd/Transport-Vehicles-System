
import React, { useState, useEffect, useRef } from 'react';
import { 
  Save, Shield, Palette, Bell, Info, Clock, Check, 
  Monitor, Paintbrush, Sun, Moon, AlertCircle, CalendarClock, BellRing, Timer,
  Trash2, Database, AlertOctagon, RefreshCcw, XCircle, Upload, Image as ImageIcon
} from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  onClearRequests?: () => void;
}

type SettingSection = 'general' | 'appearance' | 'notifications' | 'security';

const COLOR_PRESETS = [
  { name: 'أزرق ملكي', hex: '#1e3a8a' },
  { name: 'كحلي داكن', hex: '#1e40af' },
  { name: 'أرجواني', hex: '#7c3aed' },
  { name: 'أخضر غامق', hex: '#064e3b' },
  { name: 'أسود فحمي', hex: '#111827' },
  { name: 'برتقالي', hex: '#ea580c' },
];

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onClearRequests }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeSection, setActiveSection] = useState<SettingSection>('general');
  const [confirmWipe, setConfirmWipe] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = () => {
    onUpdate(localSettings);
    showToast("تم حفظ الإعدادات بنجاح!", "success");
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-10 right-10 text-white px-8 py-4 rounded-2xl font-black shadow-2xl z-[200] animate-bounce flex items-center gap-3 border-r-4 ${type === 'success' ? 'bg-green-600 border-green-800' : 'bg-red-600 border-red-800'}`;
    toast.innerHTML = type === 'success' 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> ${message}`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        showToast("حجم الملف كبير جداً (الحد الأقصى 2 ميجا)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateField('logoUrl', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDataWipeClick = () => {
    if (!confirmWipe) {
      setConfirmWipe(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setConfirmWipe(false);
      }, 5000);
    } else {
      if (onClearRequests) {
        onClearRequests();
        setConfirmWipe(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        showToast("تم مسح كافة سجلات الطلبات بنجاح", "success");
      }
    }
  };

  const updateField = (field: keyof SystemSettings, value: any) => {
    const updated = { ...localSettings, [field]: value };
    setLocalSettings(updated);
    if (['primaryColor', 'darkMode', 'fontSize', 'logoUrl'].includes(field)) {
      onUpdate(updated);
    }
  };

  const updateNestedField = (parent: keyof SystemSettings, child: string, value: any) => {
    const updated = { 
      ...localSettings, 
      [parent]: { ...(localSettings[parent] as any), [child]: value } 
    };
    setLocalSettings(updated);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>الإعدادات المركزية</h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">تحكم كامل في قواعد العمل والهوية البصرية للنظام</p>
        </div>
        <button 
          onClick={handleSave} 
          className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:opacity-90 transition-all flex items-center gap-3 active:scale-95"
          style={{ backgroundColor: localSettings.primaryColor }}
        >
          <Save size={20} /> <span>حفظ وتطبيق الإعدادات</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'general', label: 'المعلومات والقواعد العامة', icon: Info },
            { id: 'appearance', label: 'المظهر والألوان', icon: Palette },
            { id: 'notifications', label: 'التنبيهات والمتابعة', icon: Bell },
            { id: 'security', label: 'الأمان والصلاحيات', icon: Shield },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveSection(item.id as SettingSection)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black transition-all border-2 ${
                activeSection === item.id 
                  ? 'bg-primary border-primary text-white shadow-lg translate-x-1' 
                  : 'bg-white dark:bg-gray-800 border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              style={activeSection === item.id ? { backgroundColor: localSettings.primaryColor, borderColor: localSettings.primaryColor } : {}}
            >
              <item.icon size={18} strokeWidth={2.5} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {activeSection === 'general' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              <div className={`p-10 rounded-3xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm space-y-10`}>
                <div className="flex items-center gap-4 border-r-4 border-blue-500 pr-4">
                   <Info className="text-blue-500" />
                   <h3 className="text-lg font-black dark:text-white">المعلومات الإدارية</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم الوزارة / المديرية العامة</label>
                    <input 
                      type="text" 
                      value={localSettings.departmentName} 
                      onChange={(e) => updateField('departmentName', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:border-primary outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم الشعبة / الفرع الفني</label>
                    <input 
                      type="text" 
                      value={localSettings.branchName} 
                      onChange={(e) => updateField('branchName', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-bold dark:text-white focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-700">
                  <div className="flex items-center gap-4 mb-6">
                     <Timer className="text-orange-500" />
                     <h3 className="text-lg font-black dark:text-white">قواعد تواريخ الاستحقاق</h3>
                  </div>
                  
                  <div className="p-8 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border-2 border-orange-100 dark:border-orange-800/20 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                       <h4 className="font-black text-sm text-orange-900 dark:text-orange-400">مدة استحقاق الرسوم الافتراضية</h4>
                       <p className="text-xs text-orange-700/60 dark:text-orange-400/60 mt-1 font-bold">
                         تحدد هذه القيمة عدد الأيام التلقائي بين تاريخ مفاتحة الشركة وتاريخ استحقاق دفع الرسوم المالية.
                       </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                       <input 
                        type="number" 
                        min="1"
                        max="365"
                        value={localSettings.defaultSettlementDays}
                        onChange={(e) => updateField('defaultSettlementDays', parseInt(e.target.value) || 1)}
                        className="w-24 bg-white dark:bg-gray-800 border-2 border-orange-300 dark:border-orange-800 rounded-2xl px-4 py-4 text-center font-black text-xl text-orange-600 focus:ring-0 focus:border-orange-500 transition-all dark:text-white"
                       />
                       <span className="text-sm font-black text-orange-800 dark:text-orange-400">يوم</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in slide-in-from-left-4">
              {/* Logo Upload Section */}
              <div className={`p-10 rounded-3xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <h3 className="text-lg font-black mb-8 flex items-center gap-3 dark:text-white text-right">
                  <ImageIcon className="text-primary" style={{ color: localSettings.primaryColor }} /> شعار النظام
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className={`w-40 h-40 rounded-[2.5rem] border-4 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                    localSettings.logoUrl ? 'border-primary/50' : 'border-gray-200 dark:border-gray-700'
                  }`} style={localSettings.logoUrl ? { borderColor: localSettings.primaryColor + '80' } : {}}>
                    {localSettings.logoUrl ? (
                      <img src={localSettings.logoUrl} alt="System Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon size={48} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4 text-right">
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                      ارفع شعار الوزارة أو المؤسسة ليظهر في كافة أجزاء النظام والتقارير المطبوعة.
                      <br />
                      <span className="text-xs opacity-60">يفضل استخدام صورة بخلفية شفافة (PNG) وبحجم لا يتجاوز 2 ميجابايت.</span>
                    </p>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
                      >
                        <Upload size={16} /> رفع شعار جديد
                      </button>
                      {localSettings.logoUrl && (
                        <button 
                          onClick={() => updateField('logoUrl', undefined)}
                          className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-black text-xs flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all active:scale-95"
                        >
                          <Trash2 size={16} /> حذف الشعار
                        </button>
                      )}
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                        accept="image/*" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-10 rounded-3xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <h3 className="text-lg font-black mb-8 flex items-center gap-3 dark:text-white text-right">
                  <Paintbrush className="text-primary" style={{ color: localSettings.primaryColor }} /> اختيار الهوية اللونية
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {COLOR_PRESETS.map((color) => (
                    <button 
                      key={color.hex} 
                      onClick={() => updateField('primaryColor', color.hex)}
                      className={`group relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${localSettings.primaryColor === color.hex ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-gray-50'}`}
                      style={localSettings.primaryColor === color.hex ? { borderColor: localSettings.primaryColor } : {}}
                    >
                      <div className="w-10 h-10 rounded-xl shadow-md flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                        {localSettings.primaryColor === color.hex && <Check size={18} className="text-white" />}
                      </div>
                      <span className="text-[9px] font-black text-gray-400">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-10 rounded-3xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <h3 className="text-lg font-black mb-8 dark:text-white text-right">التنسيق البصري</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-sm font-black dark:text-gray-300 block text-right">حجم خط النظام</label>
                    <div className="flex gap-2 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-2xl">
                      {['small', 'medium', 'large'].map((size) => (
                        <button 
                          key={size}
                          onClick={() => updateField('fontSize', size)}
                          className={`flex-1 py-3 rounded-xl font-black text-[10px] transition-all ${localSettings.fontSize === size ? 'bg-white dark:bg-gray-600 text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                          style={localSettings.fontSize === size ? { color: localSettings.primaryColor } : {}}
                        >
                          {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-black dark:text-gray-300 block text-right">الوضع الداكن</label>
                    <button 
                      onClick={() => updateField('darkMode', !localSettings.darkMode)}
                      className={`w-full py-4 rounded-xl font-black text-xs border-2 flex items-center justify-center gap-3 transition-all ${localSettings.darkMode ? 'bg-gray-700 text-white border-blue-500' : 'bg-gray-50 text-gray-600 border-transparent'}`}
                    >
                      {localSettings.darkMode ? <Sun size={16} /> : <Moon size={16} />}
                      {localSettings.darkMode ? 'تفعيل الوضع المضيء' : 'تفعيل الوضع الليلي'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className={`p-10 rounded-3xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm space-y-8 animate-in slide-in-from-left-4`}>
               <div className="flex items-center gap-4 mb-4 text-right">
                  <div className="p-4 bg-primary/10 rounded-2xl" style={{ color: localSettings.primaryColor }}>
                    <BellRing size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black dark:text-white">تنبيهات المتابعة الذكية</h3>
                    <p className="text-sm text-gray-500 font-bold">تحكم في كيفية تنبيه النظام للمواعيد النهائية والتأخير</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-8 bg-gray-50 dark:bg-gray-700/50 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all group">
                     <div className="flex items-center gap-6">
                        <div className="p-4 bg-white dark:bg-gray-800 text-blue-600 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                           <Monitor size={24} />
                        </div>
                        <div className="text-right">
                           <h4 className="font-black text-base dark:text-white">إشعارات المتصفح المباشرة</h4>
                           <p className="text-xs text-gray-400 mt-1 font-bold">تفعيل إرسال إشعارات لسطح المكتب عند حدوث تغييرات هامة</p>
                        </div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                           type="checkbox" 
                           className="sr-only peer"
                           checked={localSettings.notifications.enableBrowser}
                           onChange={(e) => updateNestedField('notifications', 'enableBrowser', e.target.checked)}
                        />
                        <div className={`w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600`}
                             style={localSettings.notifications.enableBrowser ? { backgroundColor: localSettings.primaryColor } : {}}></div>
                     </label>
                  </div>
               </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8 animate-in slide-in-from-left-4">
               <div className={`p-10 rounded-3xl border ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm space-y-8 text-right`}>
                  <div className="flex items-center gap-5 mb-4">
                     <div className="p-5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-3xl">
                       <Shield size={32} />
                     </div>
                     <div>
                       <h3 className="text-xl font-black dark:text-white">أمن النظام والمصادقة</h3>
                       <p className="text-sm text-gray-400 font-bold mt-1">إدارة مستويات الوصول والحماية المركزية لقواعد البيانات</p>
                     </div>
                  </div>
                  <div className="p-10 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border-2 border-blue-100 dark:border-blue-800/30">
                     <p className="text-sm text-blue-700 dark:text-blue-300 font-bold leading-relaxed">
                        ملاحظة: يتم التحكم بصلاحيات المستخدمين المحددة من خلال واجهة "سجل الموظفين". تأكد من مراجعة سجل الحركات دورياً لضمان سلامة العمليات.
                     </p>
                  </div>
               </div>

               <div className={`p-10 rounded-[3rem] border-4 border-dashed transition-all duration-500 ${confirmWipe ? 'bg-orange-900/10 border-orange-500 animate-pulse' : (settings.darkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50 border-red-100')}`}>
                  <div className="flex items-center gap-5 mb-8 text-right">
                    <div className={`p-4 rounded-2xl shadow-lg transition-colors ${confirmWipe ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'}`}>
                       <AlertOctagon size={28} />
                    </div>
                    <div>
                       <h3 className={`text-xl font-black transition-colors ${confirmWipe ? 'text-orange-600' : 'text-red-600'}`}>
                         {confirmWipe ? 'مرحلة التأكيد النهائي' : 'إدارة البيانات والصيانة'}
                       </h3>
                       <p className="text-sm text-gray-400 font-bold">تحذير: هذه الإجراءات نهائية وتؤثر على كامل قاعدة بيانات النظام</p>
                    </div>
                  </div>

                  <div className={`p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm transition-all ${settings.darkMode ? 'bg-gray-900/50' : 'bg-white'}`}>
                    <div className="flex-1 text-right">
                       <div className="flex items-center gap-3 mb-2">
                          <Database size={18} className={confirmWipe ? 'text-orange-500' : 'text-red-500'} />
                          <h4 className="text-base font-black dark:text-white">تصفير سجل الطلبات</h4>
                       </div>
                       <p className="text-xs text-gray-400 font-bold leading-relaxed">
                          {confirmWipe 
                            ? "اضغط مرة أخرى للتأكيد النهائي، سيتم مسح كافة البيانات الآن!" 
                            : "سيؤدي هذا الإجراء إلى مسح كافة المعاملات والطلبات المسجلة في النظام حالياً."}
                       </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {confirmWipe && (
                        <button 
                          onClick={() => setConfirmWipe(false)}
                          className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 transition-all"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                      <button 
                        onClick={handleDataWipeClick}
                        className={`px-8 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 transition-all active:scale-95 group ${
                          confirmWipe 
                            ? 'bg-orange-600 hover:bg-orange-700 text-white animate-bounce' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {confirmWipe ? <RefreshCcw size={20} className="animate-spin" /> : <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />}
                        {confirmWipe ? 'تأكيد المسح الآن (5ث)' : 'مسح كافة بيانات الطلبات'}
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
