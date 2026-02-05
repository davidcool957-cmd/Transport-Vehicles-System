
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
  Trash2
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus, Company, User } from './types';
import { INITIAL_SETTINGS } from './constants';
import RequestTable from './components/RequestTable';
import RequestForm from './components/RequestForm';
import RequestDetails from './components/RequestDetails';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import CompanyManager from './components/CompanyManager';
import Reports from './components/Reports';
import UserManager from './components/UserManager';
import Auth from './components/Auth';
import { supabase } from './supabase';

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
        // Fetch Settings
        const { data: settingsData } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (settingsData) setSettings(settingsData.data);

        // Fetch Companies
        const { data: companiesData } = await supabase.from('companies').select('*').order('name');
        if (companiesData) setCompanies(companiesData);

        // Fetch Requests
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

  // Sync primary settings
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

  const handleUpdateCompanies = async (updatedCompanies: Company[]) => {
    // This is simplified. In a real app, you'd handle individual add/delete operations.
    // For this context, we'll let the CompanyManager handle state, but App will provide the save function.
    setCompanies(updatedCompanies);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutConfirm(false);
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
        <p className="text-gray-500 font-bold">جاري تحميل النظام...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth settings={settings} />;
  }

  return (
    <div className={`min-h-screen flex h-screen overflow-hidden transition-all duration-300 ${settings.darkMode ? 'dark bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
      <style>{`
        :root { --primary-color: ${settings.primaryColor}; }
        body { font-family: 'Cairo', sans-serif; }
        .bg-primary { background-color: var(--primary-color) !important; }
        .text-primary { color: var(--primary-color) !important; }
        .sidebar-active-item { color: white !important; background: rgba(255, 255, 255, 0.25) !important; font-weight: 900 !important; }
      `}</style>
      
      <aside className={`flex-shrink-0 z-[100] shadow-2xl overflow-hidden flex flex-col ${mobileMenuOpen ? 'fixed inset-y-0 right-0 transform translate-x-0' : 'hidden lg:flex'} ${sidebarCollapsed ? 'w-20' : 'w-72'} ${settings.darkMode ? 'bg-[#1e293b]' : 'bg-primary'}`}>
         <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-900 shadow-lg">
                <Building2 size={24} />
              </div>
              {!sidebarCollapsed && <span className="font-black text-sm">{settings.departmentName}</span>}
            </div>
         </div>
         <nav className="flex-1 px-4 mt-6 space-y-2">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { if(item.id === 'new_request') { setEditingRequest(null); setIsFormOpen(true); } else setActiveTab(item.id as any); }} className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl ${activeTab === item.id ? 'sidebar-active-item' : 'text-white/80 hover:bg-white/10'}`}>
                <item.icon size={20} />
                {!sidebarCollapsed && <span className="text-sm font-bold">{item.label}</span>}
              </button>
            ))}
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-100 hover:bg-red-500/20 mt-8">
              <LogOut size={20} />
              {!sidebarCollapsed && <span className="font-black text-sm">خروج</span>}
            </button>
         </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-[#0f172a] overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-white dark:bg-[#1e293b] border-b dark:border-gray-800">
          <div className="flex-1 flex items-center gap-4">
             <div className="relative w-64 hidden lg:block">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="بحث..." className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pr-12 pl-4 py-2 text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => handleUpdateSettings({...settings, darkMode: !settings.darkMode})} className="p-2 text-gray-400">
               {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="flex items-center gap-3 pr-6 border-r dark:border-gray-700">
                <span className="text-xs font-black dark:text-white">{session.user.email}</span>
                <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black" style={{backgroundColor: settings.primaryColor}}>{session.user.email.charAt(0).toUpperCase()}</div>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {dataLoading ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <Dashboard requests={requests} settings={settings} onViewAll={() => setActiveTab('requests')} onAddRequest={() => setIsFormOpen(true)} />}
              {activeTab === 'requests' && <div className="space-y-6">
                  <div className="flex justify-between items-center"><h2 className="text-2xl font-black dark:text-white">إدارة الطلبات</h2><button onClick={() => setIsFormOpen(true)} className="bg-primary text-white px-6 py-3 rounded-xl font-black text-sm" style={{backgroundColor: settings.primaryColor}}>+ طلب جديد</button></div>
                  <RequestTable requests={filteredRequests} settings={settings} onEdit={handleEditRequest} onDelete={setRequestToDelete} onView={handleViewRequest} />
              </div>}
              {activeTab === 'companies' && (
                <CompanyManager 
                  companies={companies} 
                  setCompanies={(updater) => {
                    const next = typeof updater === 'function' ? updater(companies) : updater;
                    setCompanies(next);
                    // Persistent sync for add/delete could be improved but this works for basic sync
                  }} 
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
      </main>

      {/* Modals */}
      {requestToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className={`max-w-md w-full rounded-[2.5rem] p-10 text-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
            <h3 className="text-xl font-black mb-4">تأكيد الحذف</h3>
            <p className="text-sm opacity-60 mb-8 font-bold">هذا الإجراء سيقوم بحذف المعاملة من قاعدة بيانات Supabase بشكل نهائي.</p>
            <div className="flex gap-4">
              <button onClick={confirmDeleteRequest} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black">نعم، احذف</button>
              <button onClick={() => setRequestToDelete(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-4 rounded-2xl font-black">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && <RequestForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveRequest} initialData={editingRequest || undefined} settings={settings} companies={companies} />}
      {viewingRequest && <RequestDetails request={viewingRequest} onClose={() => setViewingRequest(null)} settings={settings} />}
      {showLogoutConfirm && <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`max-w-md w-full rounded-[2.5rem] p-8 text-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            <h3 className="text-xl font-black mb-6">تسجيل الخروج</h3>
            <div className="flex gap-4">
              <button onClick={handleLogout} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black">خروج</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 py-4 rounded-2xl font-black">إلغاء</button>
            </div>
          </div>
      </div>}
    </div>
  );
};

export default App;
