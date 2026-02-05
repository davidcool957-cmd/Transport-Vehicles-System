
import React, { useMemo } from 'react';
import { 
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FileText, CheckCircle, Clock, AlertTriangle, ArrowLeft, Plus } from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus } from '../types';

interface DashboardProps {
  requests: VehicleRequest[];
  settings: SystemSettings;
  onViewAll: () => void;
  onAddRequest: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, settings, onViewAll, onAddRequest }) => {
  const stats = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.cancellation.status === RequestStatus.DONE).length;
    const stopped = requests.filter(r => r.cancellation.status === RequestStatus.STOPPED).length;
    
    const overdue = requests.filter(r => {
      if (r.cancellation.status === RequestStatus.DONE || r.cancellation.status === RequestStatus.STOPPED) return false;
      if (!r.requestDate) return false;
      const startDate = new Date(r.requestDate);
      const diffTime = Math.abs(new Date().getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > r.settlementDays;
    }).length;

    const pending = total - completed - stopped;

    return { total, completed, pending, overdue, stopped };
  }, [requests]);

  const summaryCards = [
    { label: 'إجمالي الطلبات', value: stats.total, icon: FileText, color: 'bg-blue-900', raw: '#1e3a8a' }, 
    { label: 'مكتملة', value: stats.completed, icon: CheckCircle, color: 'bg-green-600', raw: '#10b981' }, 
    { label: 'قيد الإجراء', value: stats.pending, icon: Clock, color: 'bg-amber-500', raw: '#f59e0b' }, 
    { label: 'متأخرة', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-600', raw: '#ef4444' } 
  ];

  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 5);

  const PIE_DATA = [
    { name: 'مكتملة', value: stats.completed },
    { name: 'قيد الإجراء', value: stats.pending },
    { name: 'موقوفة', value: stats.stopped }
  ];
  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">نظرة عامة على النظام</h1>
          <p className="text-xs lg:text-sm text-gray-500 font-bold mt-1 opacity-70">إحصائيات المتابعة وحالة المعاملات الحالية</p>
        </div>
        <button 
          onClick={onAddRequest}
          className="flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:border-primary transition-all active:scale-95"
          style={{ borderColor: settings.primaryColor + '20' }}
        >
          <Plus size={16} className="text-primary" style={{ color: settings.primaryColor }} />
          <span>تسجيل طلب سريع</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {summaryCards.map((card, i) => (
          <div key={i} className={`p-6 lg:p-8 rounded-[2rem] text-white shadow-xl flex items-center justify-between group overflow-hidden relative ${card.color}`}>
            <div className="absolute left-0 top-0 h-full w-24 flex items-center justify-center opacity-10 transform -translate-x-4">
              <card.icon size={80} strokeWidth={1} />
            </div>
            <div className="flex-1 text-right relative z-10">
              <h3 className="text-[10px] font-black opacity-80 uppercase mb-1 tracking-widest">{card.label}</h3>
              <p className="text-3xl lg:text-5xl font-black">{card.value}</p>
            </div>
            <div className="p-3 lg:p-4 bg-white/20 rounded-2xl relative z-10">
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: Donut Chart */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
          <h3 className="text-base lg:text-lg font-black mb-8 text-gray-900 dark:text-white w-full text-right pr-4 border-r-4 border-blue-500">مؤشر الإنجاز الكلي</h3>
          <div className="h-48 lg:h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {PIE_COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', direction: 'rtl', textAlign: 'right', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white">{stats.total}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">إجمالي</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 w-full">
             {PIE_DATA.map((item, idx) => (
               <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></div>
                    <span className="text-[10px] font-black text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-black dark:text-white">{item.value}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Right: Recent Requests */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 lg:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <h3 className="text-base lg:text-lg font-black text-gray-900 dark:text-white pr-4 border-r-4 border-orange-500">الطلبات المسجلة حديثاً</h3>
            <button 
              onClick={onViewAll}
              className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 transition-colors"
            >
              عرض السجل الكامل <ArrowLeft size={16} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentRequests.map((req) => (
              <div 
                key={req.id} 
                className="flex items-center justify-between p-4 lg:p-6 rounded-3xl bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent hover:border-primary/10 transition-all group"
              >
                <div className="flex items-center gap-4 lg:gap-6">
                  <div 
                    className="w-12 h-12 lg:w-16 lg:h-16 bg-white dark:bg-gray-700 text-primary rounded-2xl flex items-center justify-center font-black text-xl lg:text-2xl shadow-md border-2 border-gray-100 dark:border-gray-600 group-hover:scale-105 transition-transform"
                    style={{ color: settings.primaryColor }}
                  >
                    {req.applicantName.charAt(0)}
                  </div>
                  <div className="max-w-[150px] sm:max-w-none">
                    <h4 className="text-sm lg:text-base font-black text-gray-900 dark:text-white truncate">{req.applicantName}</h4>
                    <p className="text-[10px] lg:text-xs text-gray-400 font-bold mt-1 tracking-tighter">{req.vehicleNumber} • {req.company}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    req.cancellation.status === RequestStatus.DONE ? 'bg-green-100 text-green-700' : 
                    req.cancellation.status === RequestStatus.STOPPED ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {req.cancellation.status === RequestStatus.DONE ? 'منجز' : req.cancellation.status === RequestStatus.STOPPED ? 'موقوف' : 'متابعة'}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">{req.requestDate}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentRequests.length === 0 && (
              <div className="py-20 text-center opacity-30 flex flex-col items-center">
                <FileText size={48} />
                <p className="font-black mt-2">لا توجد سجلات حالية</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
