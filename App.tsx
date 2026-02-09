
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  Moon, 
  Sun,
  Menu,
  X,
  Building2,
  BarChart3,
  Users,
  LogOut,
  Loader2,
  Trash2,
  Home,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus, Company } from './types.ts';
import { INITIAL_SETTINGS } from './constants.ts';
import RequestTable from './components/RequestTable.tsx';
import RequestForm from './components/RequestForm.tsx';
import RequestDetails from './components/RequestDetails.tsx';
import Dashboard from './components/Dashboard.tsx';
import Settings from './components/Settings.tsx';
import CompanyManager from './components/CompanyManager.tsx';
import Reports from './components/Reports.tsx';
import UserManager from './components/UserManager.tsx';
import Auth from './components/Auth.tsx';
import { supabase } from './supabase.ts';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <div className={`fixed bottom-20 lg:bottom-10 left-1/2 -translate-x-1/2 lg:left-10 lg:translate-x-0 z-[500] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 border-b-4 ${
    type === 'success' ? 'bg-gray-900 text-white border-green-500' : 'bg-red-600 text-white border-red-800'
  }`}>
    {type === 'success' ? <CheckCircle2 size={20} className="text-green-500" /> : <AlertCircle size={20} />}
    <span className="font-bold text-sm">{message}</span>
    <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100"><X size={16} /></button>
  </div>
);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'companies' | 'reports' | 'users' | 'settings'>('dashboard');
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [editingRequest, setEditingRequest] = useState<VehicleRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<VehicleRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotificationsList, setShowNotificationsList] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session) return;
    setDataLoading(true);
    try {
      const [{ data: settingsData }, { data: companiesData }, { data: requestsData }] = await Promise.all([
        supabase.from('settings').select('*').eq('id', 1).maybeSingle(),
        supabase.from('companies').select('*').order('name'),
        supabase.from('requests').select('*').order('created_at', { ascending: false })
      ]);
      
      if (settingsData) setSettings(settingsData.data);
      if (companiesData) setCompanies(companiesData);
      if (requestsData) setRequests(requestsData);
    } catch (error) {
      showNotification("فشل في مزامنة البيانات من السحابة", "error");
    } finally {
      setDataLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    if (settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings]);

  const overdueRequests = useMemo(() => {
    const now = new Date();
    return requests.filter(req => {
      if (req.cancellation.status === RequestStatus.DONE || req.cancellation.status === RequestStatus.STOPPED) return false;
      if (req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate) {
        const dueDate = new Date(req.correspondence.bookDate);
        dueDate.setDate(dueDate.getDate() + req.settlementDays);
        return dueDate < now && req.financialSettlement.status === RequestStatus.PENDING;
      }
      return false;
    });
  }, [requests]);

  const warningRequests = useMemo(() => {
    const now = new Date();
    const warnLimit = new Date();
    warnLimit.setDate(warnLimit.getDate() + settings.notifications.notifyBeforeDays);
    
    return requests.filter(req => {
      if (req.cancellation.status === RequestStatus.DONE || req.cancellation.status === RequestStatus.STOPPED) return false;
      if (req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate) {
        const dueDate = new Date(req.correspondence.bookDate);
        dueDate.setDate(dueDate.getDate() + req.settlementDays);
        return dueDate >= now && dueDate <= warnLimit && req.financialSettlement.status === RequestStatus.PENDING;
      }
      return false;
    });
  }, [requests, settings.notifications.notifyBeforeDays]);

  const handleSaveRequest = async (data: VehicleRequest) => {
    try {
      const requestPayload = { ...data };

      if (editingRequest) {
        const { error } = await supabase.from('requests').update(requestPayload).eq('id', data.id);
        if (error) throw error;
        setRequests(prev => prev.map(r => r.id === data.id ? data : r));
        showNotification("تم تحديث بيانات المعاملة");
      } else {
        const { error } = await supabase.from('requests').insert([requestPayload]);
        if (error) throw error;
        setRequests(prev => [data, ...prev]);
        showNotification("تم تسجيل المعاملة بنجاح");
      }
      setIsFormOpen(false);
      setEditingRequest(null);
    } catch (err: any) {
      showNotification(err.message || "حدث خطأ أثناء الحفظ", "error");
    }
  };

  const confirmDeleteRequest = async () => {
    if (requestToDelete) {
      try {
        const { error } = await supabase.from('requests').delete().eq('id', requestToDelete);
        if (error) throw error;
        setRequests(prev => prev.filter(req => req.id !== requestToDelete));
        showNotification("تم حذف السجل نهائياً");
      } catch (err) {
        showNotification("خطأ في حذف البيانات", "error");
      }
      setRequestToDelete(null);
    }
  };

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    await supabase.from('settings').upsert({ id: 1, data: newSettings });
  };

  const navItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'requests', label: 'الطلبات', icon: FileText },
    { id: 'companies', label: 'الشركات', icon: Building2 },
    { id: 'reports', label: 'التقارير', icon: BarChart3 },
    { id: 'users', label: 'الموظفين', icon: Users },
    { id: 'settings', label: 'الإعدادات', icon: SettingsIcon },
  ];

  if (authLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <span className="font-bold text-gray-500">جاري الاتصال بقاعدة البيانات...</span>
    </div>
  );

  if (!session) return <Auth settings={settings} />;

  const totalAlerts = overdueRequests.length + warningRequests.length;

  return (
    <div className={`min-h-screen flex h-screen overflow-hidden ${settings.darkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-[200] w-72 transform transition-transform duration-300 lg:static lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        ${settings.darkMode ? 'bg-gray-900' : 'bg-primary'}
      `} style={{ backgroundColor: !settings.darkMode ? settings.primaryColor : undefined }}>
         <div className="p-8 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Building2 size={28} />
              <span className="font-black text-xs leading-tight">{settings.departmentName}</span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden opacity-50 hover:opacity-100"><X /></button>
         </div>
         <nav className="px-4 space-y-2">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }} 
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white/20 text-white font-black' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-200 hover:bg-red-500/20 mt-10 transition-colors">
              <LogOut size={20} />
              <span className="text-sm font-bold">تسجيل الخروج</span>
            </button>
         </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 shrink-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between px-6 lg:px-10 z-[100]">
          <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500"><Menu /></button>
          
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="بحث سريع بالاسم أو الرقم..." 
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl pr-12 pl-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsList(!showNotificationsList)}
                className={`p-3 rounded-xl text-gray-500 transition-all ${showNotificationsList ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}
                style={showNotificationsList ? { color: settings.primaryColor } : {}}
              >
                <Bell size={20} />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce">
                    {totalAlerts}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotificationsList && (
                <div className="absolute left-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                    <span className="font-black text-xs">التنبيهات والمتابعة</span>
                    <button onClick={() => setShowNotificationsList(false)} className="text-gray-400"><X size={14}/></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2 space-y-2">
                    {overdueRequests.length > 0 && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-black text-[10px] mb-2">
                          <AlertCircle size={14}/> تنبيه تجاوز الاستحقاق ({overdueRequests.length})
                        </div>
                        <ul className="space-y-1">
                          {overdueRequests.slice(0, 3).map(r => (
                            <li key={r.id} className="text-[10px] text-gray-600 dark:text-gray-300 font-bold border-r-2 border-red-300 pr-2 truncate">
                              {r.applicantName} - {r.vehicleNumber}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {warningRequests.length > 0 && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-[10px] mb-2">
                          <Clock size={14}/> اقتراب موعد الاستحقاق ({warningRequests.length})
                        </div>
                        <ul className="space-y-1">
                          {warningRequests.slice(0, 3).map(r => (
                            <li key={r.id} className="text-[10px] text-gray-600 dark:text-gray-300 font-bold border-r-2 border-amber-300 pr-2 truncate">
                              {r.applicantName} - {r.vehicleNumber}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {totalAlerts === 0 && (
                      <div className="py-10 text-center text-gray-400 text-xs font-bold">لا توجد تنبيهات حالياً</div>
                    )}
                  </div>
                  <button 
                    onClick={() => { setActiveTab('requests'); setShowNotificationsList(false); }}
                    className="w-full py-3 bg-gray-50 dark:bg-gray-900/50 text-primary text-[10px] font-black border-t dark:border-gray-700"
                    style={{ color: settings.primaryColor }}
                  >
                    عرض كافة الطلبات
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => handleUpdateSettings({...settings, darkMode: !settings.darkMode})} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors">
              {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-lg" style={{backgroundColor: settings.primaryColor}}>
              {session.user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10">
          {activeTab === 'dashboard' && <Dashboard requests={requests} settings={settings} onViewAll={() => setActiveTab('requests')} onAddRequest={() => setIsFormOpen(true)} />}
          {activeTab === 'requests' && <RequestTable requests={requests} companies={companies} globalSearchTerm={searchTerm} settings={settings} onEdit={req => {setEditingRequest(req); setIsFormOpen(true);}} onDelete={setRequestToDelete} onView={setViewingRequest} onAdd={() => {setEditingRequest(null); setIsFormOpen(true);}} />}
          {activeTab === 'companies' && <CompanyManager companies={companies} setCompanies={setCompanies} settings={settings} />}
          {activeTab === 'reports' && <Reports requests={requests} settings={settings} />}
          {activeTab === 'users' && <UserManager users={settings.users} onUpdate={u => handleUpdateSettings({...settings, users: u})} settings={settings} />}
          {activeTab === 'settings' && <Settings settings={settings} onUpdate={handleUpdateSettings} onClearRequests={() => setRequests([])} />}
        </div>

        {/* Mobile Navbar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex items-center justify-around z-[190]">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-primary' : 'text-gray-400'} style={activeTab === 'dashboard' ? {color: settings.primaryColor} : {}}><Home size={22} /></button>
          <button onClick={() => setActiveTab('requests')} className={activeTab === 'requests' ? 'text-primary' : 'text-gray-400'} style={activeTab === 'requests' ? {color: settings.primaryColor} : {}}><FileText size={22} /></button>
          <button onClick={() => {setEditingRequest(null); setIsFormOpen(true);}} className="w-14 h-14 -mt-10 bg-primary rounded-full text-white shadow-xl flex items-center justify-center border-4 border-gray-50 dark:border-gray-950" style={{backgroundColor: settings.primaryColor}}><Plus size={28} /></button>
          <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'text-primary' : 'text-gray-400'} style={activeTab === 'reports' ? {color: settings.primaryColor} : {}}><BarChart3 size={22} /></button>
          <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-primary' : 'text-gray-400'} style={activeTab === 'settings' ? {color: settings.primaryColor} : {}}><SettingsIcon size={22} /></button>
        </div>
      </main>

      {/* Modals */}
      {isFormOpen && <RequestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveRequest} initialData={editingRequest || undefined} settings={settings} companies={companies} />}
      {viewingRequest && <RequestDetails request={viewingRequest} onClose={() => setViewingRequest(null)} settings={settings} />}
      
      {requestToDelete && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] max-w-sm w-full text-center space-y-6">
            <Trash2 size={64} className="mx-auto text-red-500" />
            <h3 className="text-xl font-black dark:text-white">تأكيد حذف المعاملة؟</h3>
            <div className="flex gap-4">
              <button onClick={confirmDeleteRequest} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold active:scale-95 transition-all">حذف</button>
              <button onClick={() => setRequestToDelete(null)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold dark:text-white active:scale-95 transition-all">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
