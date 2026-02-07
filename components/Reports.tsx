
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Download, Printer, BarChart3, TrendingUp, CheckCircle, Clock, ListChecks, Building2, AlertTriangle, FileText, AlertOctagon } from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus } from '../types';

interface ReportsProps {
  requests: VehicleRequest[];
  settings: SystemSettings;
}

const Reports: React.FC<ReportsProps> = ({ requests, settings }) => {
  const stats = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.cancellation?.status === RequestStatus.DONE).length;
    const stopped = requests.filter(r => r.cancellation?.status === RequestStatus.STOPPED).length;
    const pending = total - completed - stopped;
    const financialCollected = requests.filter(r => r.financialSettlement?.status === RequestStatus.DONE).length;
    
    const companyStatsMap: Record<string, number> = {};
    requests.forEach(r => {
      const companyName = r.company || 'غير محدد';
      companyStatsMap[companyName] = (companyStatsMap[companyName] || 0) + 1;
    });
    const companyData = Object.entries(companyStatsMap).map(([name, count]) => ({ name, count }));

    return { total, completed, pending, stopped, financialCollected, companyData };
  }, [requests]);

  const handleExportPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (requests.length === 0) {
      alert("لا توجد بيانات لتصديرها حالياً.");
      return;
    }

    try {
      const headers = ['المسلسل', 'اسم المالك', 'رقم المركبة', 'الشركة', 'تاريخ الطلب', 'الحالة النهائية', 'أسباب الإيقاف/ملاحظات'];
      const rows = requests.map((r, i) => [
        i + 1,
        `"${(r.applicantName || '').replace(/"/g, '""')}"`,
        `"${(r.vehicleNumber || '').replace(/"/g, '""')}"`,
        `"${(r.company || '').replace(/"/g, '""')}"`,
        r.requestDate || '',
        r.cancellation?.status === RequestStatus.DONE ? 'منجزة كلياً' : 
        r.cancellation?.status === RequestStatus.STOPPED ? 'موقوفة إدارياً' : 'قيد الإجراء',
        r.cancellation?.status === RequestStatus.STOPPED ? `"${(r.cancellation.stopReason || '').replace(/"/g, '""')}"` : `"${(r.notes || '').replace(/"/g, '""')}"`
      ]);
      
      const BOM = '\uFEFF';
      const csvString = [headers, ...rows].map(e => e.join(",")).join("\n");
      const csvContent = BOM + csvString;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `تقرير_إلغاء_الاعتمادية_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Export Error:", error);
      alert("حدث خطأ أثناء محاولة التصدير.");
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* الترويسة المخصصة للطباعة فقط */}
      <div className="hidden print:block text-center border-b-4 border-black pb-8 mb-10">
        <div className="flex justify-between items-center px-4 mb-4">
          <div className="text-right space-y-1">
             <p className="font-black text-xl">{settings.departmentName}</p>
             <p className="font-bold text-lg">{settings.sectionName}</p>
             <p className="font-bold text-md">{settings.branchName}</p>
          </div>
          <div className="w-24 h-24">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200 text-gray-400">
                <Building2 size={32} />
              </div>
            )}
          </div>
          <div className="text-left space-y-1 font-bold text-sm">
             <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
             <p>رقم التقرير: {Math.floor(Math.random() * 90000 + 10000)}</p>
          </div>
        </div>
        <h1 className="text-3xl font-black underline">تقرير إحصائي شامل لمعاملات إلغاء الاعتمادية</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print text-right">
        <div className="text-right">
          <h2 className={`text-4xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>لوحة التقارير والتحليل</h2>
          <p className="text-gray-500 mt-2 font-bold opacity-70">النتائج الإحصائية النهائية وكشوفات الاعتمادية</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-2xl text-sm font-black border-2 dark:border-gray-700 hover:border-blue-500 transition-all shadow-xl active:scale-95"
          >
            <Printer size={22} className="text-blue-500" /> 
            <span>تصدير كـ PDF</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-3 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-2xl transition-all active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Download size={22} /> 
            <span>تصدير Excel (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'إجمالي الطلبات', value: stats.total, color: 'blue', icon: BarChart3, sub: 'معاملة مسجلة كلياً' },
          { label: 'طلبات مكتملة', value: stats.completed, color: 'green', icon: CheckCircle, sub: 'تم إلغاء اعتماديتها' },
          { label: 'معاملات موقوفة', value: stats.stopped, color: 'red', icon: AlertOctagon, sub: 'إيقاف إداري معلن' },
          { label: 'رسوم مستوفاة', value: stats.financialCollected, color: 'purple', icon: TrendingUp, sub: 'مدفوعات مالية مؤكدة' },
        ].map((card, i) => (
          <div key={i} className={`p-10 rounded-3xl border-2 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-xl group hover:border-primary transition-all text-right`}>
            <div className="flex items-center justify-between mb-6">
              <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-700 text-primary group-hover:scale-110 transition-transform no-print" style={{ color: settings.primaryColor }}>
                <card.icon size={30} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
            </div>
            <div className={`text-6xl font-black mb-3 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{card.value}</div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className={`p-12 rounded-[2.5rem] border-2 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-2xl text-right`}>
          <h3 className={`text-xl font-black mb-12 flex items-center gap-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Building2 size={28} className="text-blue-500 no-print" /> توزيع الطلبات حسب الشركات
          </h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.companyData} layout="vertical" margin={{ right: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke={settings.darkMode ? '#374151' : '#f3f4f6'} />
                <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 13, fontWeight: '900', fill: settings.darkMode ? '#9ca3af' : '#4b5563' }} orientation="right" />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', textAlign: 'right', direction: 'rtl' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="count" fill={settings.primaryColor} radius={[0, 15, 15, 0]} barSize={30}>
                  {stats.companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? settings.primaryColor : settings.primaryColor + 'cc'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-12 rounded-[2.5rem] border-2 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-2xl relative text-right`}>
          <h3 className={`text-xl font-black mb-12 flex items-center gap-4 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
            <CheckCircle size={28} className="text-green-500 no-print" /> كفاءة الإنجاز النهائية
          </h3>
          <div className="h-96 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'مكتمل', value: stats.completed },
                    { name: 'موقوف', value: stats.stopped },
                    { name: 'قيد الإجراء', value: stats.pending }
                  ]}
                  innerRadius={110}
                  outerRadius={150}
                  paddingAngle={12}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className={`text-7xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                {Math.round((stats.completed / (stats.total || 1)) * 100)}%
              </span>
              <span className="text-sm font-black text-gray-400 tracking-widest uppercase mt-3">نسبة الإنجاز</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-12 rounded-[2.5rem] border-2 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-2xl overflow-hidden`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 text-right no-print">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 text-primary rounded-3xl" style={{ color: settings.primaryColor }}>
              <ListChecks size={35} strokeWidth={2.5} />
            </div>
            <div className="text-right">
              <h3 className={`text-3xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>الكشف التفصيلي النهائي</h3>
              <p className="text-sm font-bold text-gray-400 mt-1">سجل رقمي شامل لكافة الحركات والاعتمادات</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border dark:border-gray-700 rtl">
          <table className="w-full text-right border-collapse border-spacing-0">
            <thead>
              <tr className={`text-sm font-black border-b-2 uppercase tracking-tight ${settings.darkMode ? 'text-gray-300 border-gray-700 bg-gray-700/50' : 'text-gray-600 border-gray-100 bg-gray-50'}`}>
                <th className="px-8 py-6">#</th>
                <th className="px-8 py-6">اسم المالك</th>
                <th className="px-8 py-6">رقم المركبة</th>
                <th className="px-8 py-6">الحالة التنفيذية</th>
                <th className="px-8 py-6">تاريخ التقديم</th>
                <th className="px-8 py-6">السبب / الملاحظات</th>
              </tr>
            </thead>
            <tbody className={`text-sm divide-y ${settings.darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {requests.map((req, idx) => (
                <tr key={req.id} className={`${settings.darkMode ? 'hover:bg-gray-700/60' : 'hover:bg-gray-50/80'} transition-all ${req.cancellation?.status === RequestStatus.STOPPED ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                  <td className="px-8 py-6 font-black text-gray-400">{idx + 1}</td>
                  <td className={`px-8 py-6 font-black ${req.cancellation?.status === RequestStatus.STOPPED ? 'text-red-800' : settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{req.applicantName}</td>
                  <td className="px-8 py-6 font-bold text-blue-600 dark:text-blue-400 tracking-tighter">{req.vehicleNumber}</td>
                  <td className="px-8 py-6">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      req.cancellation?.status === RequestStatus.DONE 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : req.cancellation?.status === RequestStatus.STOPPED
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {req.cancellation?.status === RequestStatus.DONE ? 'منجزة كلياً' : 
                       req.cancellation?.status === RequestStatus.STOPPED ? 'موقوفة نهائياً' : 'قيد المتابعة'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-gray-400">{req.requestDate}</td>
                  <td className={`px-8 py-6 text-xs font-bold ${req.cancellation?.status === RequestStatus.STOPPED ? 'text-red-700 italic' : 'text-gray-500'}`}>
                    {req.cancellation?.status === RequestStatus.STOPPED ? req.cancellation.stopReason : (req.notes || '—')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* منطقة التواقيع للطباعة فقط */}
        <div className="hidden print:grid grid-cols-3 gap-12 text-center mt-16 pt-12 border-t-2 border-gray-300 rtl">
          <div className="space-y-16">
            <p className="font-black text-lg underline">توقيع مدقق القسم</p>
            <p className="font-bold text-gray-400">........................</p>
          </div>
          <div className="space-y-16">
            <p className="font-black text-lg underline">ختم شعبة الاعتمادية</p>
            <div className="w-32 h-32 border-4 border-dashed border-gray-200 rounded-full mx-auto flex items-center justify-center italic text-gray-200 text-xs">مكان الختم الرسمي</div>
          </div>
          <div className="space-y-16">
            <p className="font-black text-lg underline">مصادقة مدير الدائرة</p>
            <p className="font-bold text-gray-400">........................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
