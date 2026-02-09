
import React, { useState, useMemo } from 'react';
import { 
  Edit2, Trash2, Calendar, CheckCircle, Clock, 
  Search, Printer, Eye, Plus, Download, AlertTriangle, AlertOctagon, PenTool, ClipboardCheck, Filter, X, Building2, ChevronDown
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus, Company } from '../types';

interface RequestTableProps {
  requests: VehicleRequest[];
  companies: Company[];
  globalSearchTerm?: string;
  settings: SystemSettings;
  onEdit: (req: VehicleRequest) => void;
  onDelete: (id: string) => void;
  onView: (req: VehicleRequest) => void;
  onAdd: () => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, companies, globalSearchTerm = '', settings, onEdit, onDelete, onView, onAdd }) => {
  // حالة الفلاتر المحلية
  const [filterName, setFilterName] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const calculateDueDate = (bookDate: string, days: number) => {
    if (!bookDate || isNaN(Date.parse(bookDate))) return null;
    const date = new Date(bookDate);
    date.setDate(date.getDate() + days);
    return date;
  };

  const getLatestStepInfo = (req: VehicleRequest) => {
    if (req.cancellation.status !== RequestStatus.PENDING) {
      return { label: 'القرار', status: req.cancellation.status };
    }
    if (req.financialSettlement.status !== RequestStatus.PENDING) {
      return { label: 'الرسوم', status: req.financialSettlement.status };
    }
    if (req.correspondence.status !== RequestStatus.PENDING) {
      return { label: 'المفاتحة', status: req.correspondence.status };
    }
    return { label: 'المعاملة', status: RequestStatus.PENDING };
  };

  const isRequestOverdue = (req: VehicleRequest) => {
    if (req.cancellation.status === RequestStatus.DONE || req.cancellation.status === RequestStatus.STOPPED) return false;
    if (req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate) {
      const dueDate = calculateDueDate(req.correspondence.bookDate, req.settlementDays);
      if (dueDate) {
        return dueDate < new Date() && req.financialSettlement.status === RequestStatus.PENDING;
      }
    }
    return false;
  };

  // تطبيق منطق الفلترة المتقدم
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // البحث العالمي (من الهيدر)
      const matchesGlobal = (req.applicantName || "").toLowerCase().includes(globalSearchTerm.toLowerCase()) || 
                            (req.vehicleNumber || "").toLowerCase().includes(globalSearchTerm.toLowerCase());
      
      // فلاتر الواجهة المحلية
      const matchesName = req.applicantName.toLowerCase().includes(filterName.toLowerCase());
      const matchesVehicle = req.vehicleNumber.toLowerCase().includes(filterVehicle.toLowerCase());
      const matchesCompany = filterCompany === 'all' || req.company === filterCompany;
      
      // فلترة الحالة
      const latest = getLatestStepInfo(req);
      let matchesStatus = true;
      if (filterStatus !== 'all') {
        if (filterStatus === 'overdue') {
          matchesStatus = isRequestOverdue(req);
        } else if (filterStatus === 'STOPPED') {
          matchesStatus = req.cancellation.status === RequestStatus.STOPPED;
        } else {
          matchesStatus = latest.status === filterStatus;
        }
      }

      // فلترة التاريخ
      let matchesDate = true;
      if (filterDateFrom) {
        matchesDate = matchesDate && new Date(req.requestDate) >= new Date(filterDateFrom);
      }
      if (filterDateTo) {
        matchesDate = matchesDate && new Date(req.requestDate) <= new Date(filterDateTo);
      }

      return matchesGlobal && matchesName && matchesVehicle && matchesCompany && matchesStatus && matchesDate;
    });
  }, [requests, globalSearchTerm, filterName, filterVehicle, filterCompany, filterStatus, filterDateFrom, filterDateTo]);

  const resetFilters = () => {
    setFilterName('');
    setFilterVehicle('');
    setFilterCompany('all');
    setFilterStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className={`text-2xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>سجل الطلبات والمعاملات</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-3.5 rounded-2xl flex items-center gap-2 text-sm font-black transition-all ${showAdvancedFilters ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
            style={showAdvancedFilters ? { backgroundColor: settings.primaryColor } : {}}
          >
            <Filter size={20} />
            <span>{showAdvancedFilters ? 'إخفاء الفلاتر' : 'تصفية متقدمة'}</span>
          </button>
          <button 
            onClick={onAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Plus size={18} />
            <span>تسجيل طلب جديد</span>
          </button>
          <button onClick={handlePrint} title="طباعة" className="p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary transition-all border dark:border-gray-700">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilters && (
        <div className={`p-8 rounded-[2rem] border-2 animate-in slide-in-from-top-4 duration-300 no-print ${settings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-xl'}`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black flex items-center gap-2 dark:text-white">
              <Filter size={16} className="text-primary" style={{color: settings.primaryColor}} /> أدوات التصفية التفصيلية
            </h3>
            <button onClick={resetFilters} className="text-[10px] font-black text-red-500 flex items-center gap-1 hover:underline">
              <X size={12} /> إعادة تعيين كافة الفلاتر
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search by Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">بحث بأسم مقدم الطلب</label>
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none focus:border-primary transition-colors"
                  placeholder="اكتب الاسم هنا..."
                  value={filterName}
                  onChange={e => setFilterName(e.target.value)}
                />
              </div>
            </div>

            {/* Search by Vehicle */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">رقم المركبة / الشاصي</label>
              <div className="relative">
                <PenTool size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none focus:border-primary transition-colors"
                  placeholder="رقم اللوحة..."
                  value={filterVehicle}
                  onChange={e => setFilterVehicle(e.target.value)}
                />
              </div>
            </div>

            {/* Filter by Company */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">الشركة المعتمدة</label>
              <div className="relative">
                <Building2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none appearance-none"
                  value={filterCompany}
                  onChange={e => setFilterCompany(e.target.value)}
                >
                  <option value="all">كل الشركات</option>
                  {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">حالة المعاملة</label>
              <div className="relative">
                <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none appearance-none"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">كافة الحالات</option>
                  <option value={RequestStatus.PENDING}>قيد الإجراء</option>
                  <option value={RequestStatus.PRINTED}>قيد التوقيع</option>
                  <option value={RequestStatus.DONE}>تم الإنجاز</option>
                  <option value="STOPPED">المعاملات الموقوفة</option>
                  <option value="overdue">تجاوز الاستحقاق ⚠️</option>
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t dark:border-gray-800">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">تاريخ الطلب (من)</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none"
                value={filterDateFrom}
                onChange={e => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">تاريخ الطلب (إلى)</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 rounded-xl border-2 dark:bg-gray-800 dark:text-white text-xs font-bold outline-none"
                value={filterDateTo}
                onChange={e => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Info Bar */}
      <div className={`px-6 py-4 flex items-center justify-between rounded-3xl border-2 no-print ${settings.darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 shadow-sm text-gray-600'}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-xs font-black">نتائج البحث: {filteredRequests.length} معاملة مطابقة</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold">
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> متجاوزة</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500"></div> قيد التوقيع</div>
           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> مكتملة</div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className={`overflow-hidden rounded-[2.5rem] border-2 ${settings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-2xl'}`}>
        <table className="w-full text-right border-collapse">
          <thead className={`text-[10px] font-black uppercase tracking-widest ${settings.darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            <tr>
              <th className="px-10 py-6">مقدم الطلب</th>
              <th className="px-10 py-6">المركبة</th>
              <th className="px-10 py-6">رقم الكتاب</th>
              <th className="px-10 py-6">تاريخ الاستحقاق</th>
              <th className="px-10 py-6">الحالة (آخر إجراء)</th>
              <th className="px-10 py-6 text-center no-print">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-800">
            {filteredRequests.map((req) => {
              const latestStep = getLatestStepInfo(req);
              const overdue = isRequestOverdue(req);
              const isStopped = req.cancellation.status === RequestStatus.STOPPED;
              const isDone = req.cancellation.status === RequestStatus.DONE;
              const isPrinted = latestStep.status === RequestStatus.PRINTED;
              const dueDate = calculateDueDate(req.correspondence.bookDate || '', req.settlementDays);
              
              return (
                <tr key={req.id} className={`transition-all ${
                  isStopped ? 'bg-red-50/20 dark:bg-red-900/10 grayscale-[0.2]' : 
                  overdue ? 'bg-red-50/50 dark:bg-red-900/20' : 
                  isPrinted ? 'bg-sky-50/50 dark:bg-sky-900/10' :
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                        isStopped ? 'bg-red-100 text-red-600' : 
                        isPrinted ? 'bg-sky-100 text-sky-600' :
                        overdue ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                      }`} style={(!overdue && !isStopped && !isPrinted) ? {color: settings.primaryColor} : {}}>{req.applicantName.charAt(0)}</div>
                      <div>
                        <div className={`font-black ${isStopped ? 'text-red-700' : isPrinted ? 'text-sky-700' : overdue ? 'text-red-700' : 'dark:text-white'}`}>{req.applicantName}</div>
                        <div className="text-[10px] text-gray-400 font-bold">{req.requestDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`text-sm font-black ${isStopped ? 'text-red-600' : isPrinted ? 'text-sky-600' : overdue ? 'text-red-600' : 'dark:text-gray-300'}`}>{req.vehicleNumber}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">{req.company}</div>
                  </td>
                  <td className="px-10 py-6">
                    {req.correspondence.bookNumber ? (
                      <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-blue-600 px-3 py-1 rounded-lg">
                        رقم {req.correspondence.bookNumber}
                      </span>
                    ) : (
                      <span className="text-gray-300 italic text-xs">قيد الانتظار</span>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    {dueDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className={overdue ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-xs font-black ${overdue ? 'text-red-600' : 'text-gray-500'}`}>{dueDate.toLocaleDateString('ar-EG')}</span>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black flex items-center w-fit gap-2 ${
                        isStopped ? 'bg-red-600 text-white shadow-sm' : 
                        isDone ? 'bg-green-100 text-green-700 border border-green-200' : 
                        isPrinted ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                        overdue ? 'bg-red-100 text-red-700 border border-red-200' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {isStopped ? <AlertOctagon size={12}/> : 
                         isDone ? <CheckCircle size={12}/> : 
                         isPrinted ? <PenTool size={12}/> : 
                         overdue ? <AlertTriangle size={12}/> : 
                         <Clock size={12}/>}
                        
                        {latestStep.label}: {latestStep.status}
                      </span>
                      {overdue && <span className="text-[8px] font-black text-red-500 mr-2">تجاوز فترة الاستحقاق!</span>}
                    </div>
                  </td>
                  <td className="px-10 py-6 no-print">
                    <div className="flex justify-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onView(req); }} title="عرض" className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary transition-colors"><Eye size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onEdit(req); }} title="تعديل" className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 transition-colors"><Edit2 size={16}/></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(req.id); }} title="حذف" className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <Search size={64} className="mb-4" />
                    <p className="font-black text-xl italic">لم نجد أي نتائج تطابق معايير البحث الحالية...</p>
                    <button onClick={resetFilters} className="mt-4 text-primary font-black underline" style={{color: settings.primaryColor}}>إعادة ضبط الفلاتر</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;
