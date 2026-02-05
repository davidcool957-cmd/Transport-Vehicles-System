
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
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  AlertTriangle,
  Trash2,
  Home
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus, Company, User } from './types.ts';
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

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifiedIds = useRef<Set<string>>(new Set());

  // Auth Listener
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

  // Data Initial Fetch
  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (settingsData) setSettings(settingsData.data);

        const { data: companiesData } = await supabase.from('companies').select('*').order('name');
        if (companiesData) setCompanies(companiesData);

        const { data: requestsData } = await supabase.from('requests').select('*').order('created_at', { ascending: false });
        if (requestsData) setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [session]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.fontSize = fontSizes[settings.fontSize];
    if (settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const name = (req.applicantName || "").toLowerCase();
      const plate = (req.vehicleNumber || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      const matchesSearch = name.includes(term) || plate.includes(term);
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'pending' && req.cancellation.status === RequestStatus.PENDING) ||
        (filterStatus === 'done' && req.cancellation.status === RequestStatus.DONE) ||
        (filterStatus === 'stopped' && req.cancellation.status === RequestStatus.STOPPED);
      return matchesSearch && matchesFilter;
    });
  }, [requests, searchTerm, filterStatus]);

  const handleEditRequest = useCallback((req: VehicleRequest) => {
    setEditingRequest(req);
    setIsFormOpen(true);
  }, []);

  const handleViewRequest = useCallback((req: VehicleRequest) => {
    setViewingRequest(req);
  }, []);

  const handleSaveRequest = useCallback(async (data: VehicleRequest) => {
    try {
      if (editingRequest) {
        const { error } = await supabase.from('requests').update(data).eq('id', data.id);
        if (!error) setRequests(prev => prev.map(r => r.id === data.id ? data : r));
      } else {
        const newId = Math.random().toString(36).substr(2, 9);
        const newRequest = { ...data, id: newId };
        const { error } = await supabase.from('requests').insert([newRequest]);
        if (!error) setRequests(prev => [newRequest, ...prev]);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
    setIsFormOpen(false);
    setEditingRequest(null);
  }, [editingRequest]);

  const confirmDeleteRequest = useCallback(async () => {
    if (requestToDelete) {
      try {
        const { error } = await supabase.from('requests').delete().eq('id', requestToDelete);
        if (!error) {
          setRequests(prev => prev.filter(req => req.id !== requestToDelete));
          notifiedIds.current.delete(requestToDelete);
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
      setRequestToDelete(null);
    }
  }, [requestToDelete]);

  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    await supabase.from('settings').upsert({ id: 1, data: newSettings });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'الواجهة الرئيسية', icon: LayoutDashboard },
    { id: 'requests', label: 'إدارة الطلبات', icon: FileText },
    { id: 'new_request', label: 'تسجيل طلب جديد', icon: Plus, isAction: true },
    { id: 'companies', label: 'الشركات المعتمدة', icon: Building2 },
    { id: 'reports', label: 'مركز التقارير', icon: BarChart3 },
    { id: 'users', label: 'سجل الموظفين', icon: Users },
    { id: 'settings', label: 'إعدادات النظام', icon: SettingsIcon },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f1f5f9] font-['Cairo']">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold text-center px-4">جاري تحميل النظام... يرجى الانتظار</p>
      </div>
    );
  }

  if (!session) {
    return <Auth settings={settings} />;
  }

  return (
    <div className={`min-h-screen flex h-screen overflow-hidden transition-all duration-300 ${settings.darkMode ? 'dark bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
      
      {/* Sidebar for Desktop & Mobile Overlay */}
      <aside className={`
        flex-shrink-0 z-[200] shadow-2xl overflow-hidden flex flex-col transition-all duration-300
        ${mobileMenuOpen ? 'fixed inset-y-0 right-0 w-72 translate-x-0' : 'fixed lg:static inset-y-0 right-0 w-72 translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        ${settings.darkMode ? 'bg-[#1e293b]' : 'bg-primary'}
      `} style={{ backgroundColor: !settings.darkMode ? settings.primaryColor : undefined }}>
         
         <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-lg shrink-0">
                <Building2 size={24} />
              </div>
              {(!sidebarCollapsed || mobileMenuOpen) && <span className="font-black text-sm">{settings.departmentName}</span>}
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-white/50 hover:text-white p-2">
              <X size={24} />
            </button>
         </div>

         <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => { 
                  if(item.id === 'new_request') { 
                    setEditingRequest(null); 
                    setIsFormOpen(true); 
                  } else {
                    setActiveTab(item.id as any);
                  }
                  setMobileMenuOpen(false);
                }} 
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-white/20 text-white font-black' : 'text-white/80 hover:bg-white/10'}`}
              >
                <item.icon size={20} />
                {(!sidebarCollapsed || mobileMenuOpen) && <span className="text-sm font-bold">{item.label}</span>}
              </button>
            ))}
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-100 hover:bg-red-500/20 mt-8">
              <LogOut size={20} />
              {(!sidebarCollapsed || mobileMenuOpen) && <span className="font-black text-sm">خروج</span>}
            </button>
         </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden relative pb-16 lg:pb-0">
        
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-[#1e293b] border-b dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-500 dark:text-gray-400">
               <Menu size={24} />
             </button>
             <div className="relative w-48 lg:w-64 hidden sm:block">
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="بحث سريع..." 
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pr-10 pl-4 py-2 text-xs lg:text-sm outline-none focus:ring-2 focus:ring-primary/20" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
             </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
             <button onClick={() => handleUpdateSettings({...settings, darkMode: !settings.darkMode})} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
               {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="flex items-center gap-3 pr-2 lg:pr-6 border-r dark:border-gray-700">
                <span className="text-[10px] lg:text-xs font-black dark:text-white hidden sm:block truncate max-w-[100px]">{session.user.email}</span>
                <div className="w-8 h-8 lg:w-10 lg:h-10 text-white rounded-xl flex items-center justify-center font-black text-xs lg:text-base shadow-lg" style={{backgroundColor: settings.primaryColor}}>
                  {session.user.email.charAt(0).toUpperCase()}
                </div>
             </div>
          </div>
        </header>

        {/* Content Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-gray-400 font-bold">جاري تحديث البيانات...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <Dashboard requests={requests} settings={settings} onViewAll={() => setActiveTab('requests')} onAddRequest={() => setIsFormOpen(true)} />}
              {activeTab === 'requests' && <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-xl lg:text-2xl font-black dark:text-white">إدارة الطلبات</h2>
                    <button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg active:scale-95" style={{backgroundColor: settings.primaryColor}}>+ طلب جديد</button>
                  </div>
                  <RequestTable requests={filteredRequests} settings={settings} onEdit={handleEditRequest} onDelete={setRequestToDelete} onView={handleViewRequest} />
              </div>}
              {activeTab === 'companies' && (
                <CompanyManager 
                  companies={companies} 
                  setCompanies={setCompanies} 
                  settings={settings} 
                />
              )}
              {activeTab === 'reports' && <Reports requests={requests} settings={settings} />}
              {activeTab === 'users' && <UserManager users={settings.users} onUpdate={(u) => handleUpdateSettings({...settings, users: u})} settings={settings} />}
              {activeTab === 'settings' && <Settings settings={settings} onUpdate={handleUpdateSettings} onClearRequests={async () => {
                await supabase.from('requests').delete().neq('id', '0');
                setRequests([]);
              }} />}
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className={`lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white dark:bg-[#1e293b] border-t dark:border-gray-800 flex items-center justify-around px-4 z-[180] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]`}>
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-400'}`} style={activeTab === 'dashboard' ? { color: settings.primaryColor } : {}}>
            <Home size={20} />
            <span className="text-[10px] font-black">الرئيسية</span>
          </button>
          <button onClick={() => setActiveTab('requests')} className={`flex flex-col items-center gap-1 ${activeTab === 'requests' ? 'text-primary' : 'text-gray-400'}`} style={activeTab === 'requests' ? { color: settings.primaryColor } : {}}>
            <FileText size={20} />
            <span className="text-[10px] font-black">الطلبات</span>
          </button>
          <button onClick={() => { setEditingRequest(null); setIsFormOpen(true); }} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg -mt-8 border-4 border-[#f8fafc] dark:border-[#0f172a]" style={{ backgroundColor: settings.primaryColor }}>
            <Plus size={24} />
          </button>
          <button onClick={() => setActiveTab('reports')} className={`flex flex-col items-center gap-1 ${activeTab === 'reports' ? 'text-primary' : 'text-gray-400'}`} style={activeTab === 'reports' ? { color: settings.primaryColor } : {}}>
            <BarChart3 size={20} />
            <span className="text-[10px] font-black">التقارير</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-primary' : 'text-gray-400'}`} style={activeTab === 'settings' ? { color: settings.primaryColor } : {}}>
            <SettingsIcon size={20} />
            <span className="text-[10px] font-black">الإعدادات</span>
          </button>
        </div>
      </main>

      {/* Modals & Overlays */}
      {requestToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className={`max-w-md w-full rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 text-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><Trash2 size={32} /></div>
            <h3 className="text-lg lg:text-xl font-black mb-4">تأكيد الحذف النهائي</h3>
            <p className="text-xs lg:text-sm opacity-60 mb-8 font-bold leading-relaxed">يرجى الانتباه! هذا الإجراء سيقوم بحذف بيانات المعاملة بشكل نهائي ولا يمكن التراجع عنه.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={confirmDeleteRequest} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-sm order-2 sm:order-1 active:scale-95">نعم، حذف</button>
              <button onClick={() => setRequestToDelete(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-4 rounded-2xl font-black text-sm order-1 sm:order-2 active:scale-95">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && <RequestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveRequest} initialData={editingRequest || undefined} settings={settings} companies={companies} />}
      {viewingRequest && <RequestDetails request={viewingRequest} onClose={() => setViewingRequest(null)} settings={settings} />}
      {showLogoutConfirm && <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`max-w-md w-full rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-10 text-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h3 className="text-xl font-black mb-6">هل تريد تسجيل الخروج؟</h3>
            <div className="flex gap-4">
              <button onClick={handleLogout} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black active:scale-95">خروج</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-4 rounded-2xl font-black active:scale-95">إلغاء</button>
            </div>
          </div>
      </div>}
    </div>
  );
};

export default App;
