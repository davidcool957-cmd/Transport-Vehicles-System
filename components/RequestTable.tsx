
import React from 'react';
import { 
  Edit2, Trash2, Calendar, CheckCircle, Clock, 
  Search, Printer, Eye, Plus, Download, AlertTriangle, AlertOctagon, PenTool, ClipboardCheck
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus } from '../types';

interface RequestTableProps {
  requests: VehicleRequest[];
  settings: SystemSettings;
  onEdit: (req: VehicleRequest) => void;
  onDelete: (id: string) => void;
  onView: (req: VehicleRequest) => void;
  onAdd: () => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, settings, onEdit, onDelete, onView, onAdd }) => {
  const calculateDueDate = (bookDate: string, days: number) => {
    if (!bookDate || isNaN(Date.parse(bookDate))) return null;
    const date = new Date(bookDate);
    date.setDate(date.getDate() + days);
    return date;
  };

  // دالة لتحديد آخر إجراء نشط في المسار
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

  const getRowStatusType = (req: VehicleRequest) => {
    if (req.cancellation.status === RequestStatus.STOPPED) return 'STOPPED';
    if (req.cancellation.status === RequestStatus.DONE) return 'COMPLETED';
    
    const latest = getLatestStepInfo(req);
    if (latest.status === RequestStatus.PRINTED) return 'PRINTED';
    
    // Check if overdue based on correspondence date
    if (req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate) {
      const dueDate = calculateDueDate(req.correspondence.bookDate, req.settlementDays);
      if (dueDate) {
        const now = new Date();
        if (dueDate < now && req.financialSettlement.status === RequestStatus.PENDING) return 'OVERDUE';
        
        const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= settings.notifications.notifyBeforeDays) return 'WARNING';
      }
    }
    return 'IN_PROGRESS';
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.print();
  };

  const handleExportCSV = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (requests.length === 0) return;
    const headers = ['الاسم', 'رقم المركبة', 'الشركة', 'الحالة', 'تاريخ الطلب', 'القرار النهائي'];
    const rows = requests.map(r => [
      `"${r.applicantName}"`,
      `"${r.vehicleNumber}"`,
      `"${r.company}"`,
      getLatestStepInfo(r).status,
      r.requestDate,
      r.cancellation.status === RequestStatus.STOPPED ? `موقوفة: ${r.cancellation.stopReason}` : r.cancellation.status
    ]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `طلبات_الاعتمادية_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <h2 className={`text-2xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>سجل الطلبات والمعاملات</h2>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onAdd}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Plus size={18} />
            <span>تسجيل طلب جديد</span>
          </button>
          <button onClick={handleExportCSV} title="تصدير Excel" className="p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-green-600 transition-all border dark:border-gray-700">
            <Download size={20} />
          </button>
          <button onClick={handlePrint} title="طباعة" className="p-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary transition-all border dark:border-gray-700">
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Info Bar */}
      <div className={`px-6 py-4 flex items-center justify-between rounded-3xl border-2 no-print ${settings.darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 shadow-sm text-gray-600'}`}>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-xs font-black">إجمالي المعاملات: {requests.length} سجل</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold">
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
            {requests.map((req) => {
              const statusType = getRowStatusType(req);
              const latestStep = getLatestStepInfo(req);
              const dueDate = calculateDueDate(req.correspondence.bookDate || '', req.settlementDays);
              const isOverdue = statusType === 'OVERDUE';
              const isStopped = statusType === 'STOPPED';
              const isPrinted = latestStep.status === RequestStatus.PRINTED;
              const isDone = latestStep.status === RequestStatus.DONE;
              
              return (
                <tr key={req.id} className={`transition-all ${
                  isStopped ? 'bg-red-50/20 dark:bg-red-900/10 grayscale-[0.2]' : 
                  isOverdue ? 'bg-red-50/50 dark:bg-red-900/20' : 
                  isPrinted ? 'bg-sky-50/50 dark:bg-sky-900/10' :
                  'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                        isStopped ? 'bg-red-100 text-red-600' : 
                        isPrinted ? 'bg-sky-100 text-sky-600' :
                        isOverdue ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                      }`} style={(!isOverdue && !isStopped && !isPrinted) ? {color: settings.primaryColor} : {}}>{req.applicantName.charAt(0)}</div>
                      <div>
                        <div className={`font-black ${isStopped ? 'text-red-700' : isPrinted ? 'text-sky-700' : isOverdue ? 'text-red-700' : 'dark:text-white'}`}>{req.applicantName}</div>
                        <div className="text-[10px] text-gray-400 font-bold">{req.requestDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className={`text-sm font-black ${isStopped ? 'text-red-600' : isPrinted ? 'text-sky-600' : isOverdue ? 'text-red-600' : 'dark:text-gray-300'}`}>{req.vehicleNumber}</div>
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
                        <Calendar size={14} className={isOverdue ? 'text-red-500' : 'text-gray-400'} />
                        <span className={`text-xs font-black ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>{dueDate.toLocaleDateString('ar-EG')}</span>
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black flex items-center w-fit gap-2 ${
                        isStopped ? 'bg-red-600 text-white shadow-sm' : 
                        isDone ? 'bg-green-100 text-green-700 border border-green-200' : 
                        isPrinted ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                        isOverdue ? 'bg-red-100 text-red-700 border border-red-200' : 
                        statusType === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isStopped ? <AlertOctagon size={12}/> : 
                         isDone ? <CheckCircle size={12}/> : 
                         isPrinted ? <PenTool size={12}/> : 
                         isOverdue ? <AlertTriangle size={12}/> : 
                         <Clock size={12}/>}
                        
                        {/* النص الديناميكي حسب آخر إجراء */}
                        {latestStep.label}: {latestStep.status}
                      </span>
                      {isOverdue && <span className="text-[8px] font-black text-red-500 mr-2">تجاوز فترة الاستحقاق!</span>}
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
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-10 py-20 text-center text-gray-400 font-bold italic">لا توجد سجلات مطابقة للبحث حالياً...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;
