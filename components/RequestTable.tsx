
import React from 'react';
import { 
  Edit2, Trash2, Calendar, CheckCircle, Clock, 
  StopCircle, Search,
  Download, Printer, Eye
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus } from '../types';

interface RequestTableProps {
  requests: VehicleRequest[];
  settings: SystemSettings;
  onEdit: (req: VehicleRequest) => void;
  onDelete: (id: string) => void;
  onView: (req: VehicleRequest) => void;
}

const RequestTable: React.FC<RequestTableProps> = ({ requests, settings, onEdit, onDelete, onView }) => {
  const calculateDueDate = (bookDate: string, days: number) => {
    if (!bookDate) return new Date();
    const date = new Date(bookDate);
    date.setDate(date.getDate() + days);
    return date;
  };

  const getRowStatus = (req: VehicleRequest) => {
    if (req.cancellation.status === RequestStatus.STOPPED) return 'STOPPED';
    if (req.cancellation.status === RequestStatus.DONE) return 'COMPLETED';
    
    if (req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate) {
      const dueDate = calculateDueDate(req.correspondence.bookDate, req.settlementDays);
      const now = new Date();
      
      if (dueDate < now) {
        return settings.notifications.notifyOnOverdue ? 'OVERDUE' : 'IN_PROGRESS';
      }
      
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= settings.notifications.notifyBeforeDays) {
        return 'WARNING';
      }
      
      return 'IN_PROGRESS';
    }
    return 'INITIAL';
  };

  const handleDeleteBtn = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  const handleEditBtn = (e: React.MouseEvent, req: VehicleRequest) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(req);
  };

  const handleViewBtn = (e: React.MouseEvent, req: VehicleRequest) => {
    e.preventDefault();
    e.stopPropagation();
    onView(req);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (requests.length === 0) {
      alert("لا توجد بيانات لتصديرها.");
      return;
    }

    try {
      const headers = ['#', 'الاسم الكامل', 'تاريخ الطلب', 'رقم اللوحة', 'الشركة', 'العائدية', 'رقم الكتاب', 'تاريخ الكتاب', 'تاريخ الاستحقاق', 'حالة المعاملة', 'السبب/الملاحظات'];
      const rows = requests.map((req, i) => {
        const dueDate = req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate 
          ? calculateDueDate(req.correspondence.bookDate, req.settlementDays).toLocaleDateString('ar-EG')
          : '—';
          
        const internalStatus = getRowStatus(req);
        let statusLabel = 'قيد المراجعة';
        if (internalStatus === 'STOPPED') statusLabel = 'موقوفة';
        else if (internalStatus === 'COMPLETED') statusLabel = 'منجزة كلياً';
        else if (internalStatus === 'OVERDUE') statusLabel = 'متجاوزة';
        else if (internalStatus === 'WARNING') statusLabel = 'قرب الاستحقاق';
        else if (internalStatus === 'IN_PROGRESS') statusLabel = 'قيد الاستيفاء';

        return [
          i + 1,
          `"${req.applicantName.replace(/"/g, '""')}"`,
          req.requestDate,
          `"${req.vehicleNumber.replace(/"/g, '""')}"`,
          `"${req.company.replace(/"/g, '""')}"`,
          `"${req.ownership.replace(/"/g, '""')}"`,
          `"${(req.correspondence.bookNumber || '').replace(/"/g, '""')}"`,
          req.correspondence.bookDate || '',
          dueDate,
          statusLabel,
          `"${(req.notes || '').replace(/"/g, '""')}"`
        ];
      });
      
      const BOM = '\uFEFF';
      const csvString = [headers, ...rows].map(e => e.join(",")).join("\n");
      const csvContent = BOM + csvString;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `سجل_المعاملات_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
    } catch (error) {
      console.error(error);
      alert("فشل التصدير.");
    }
  };

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          .no-print, .lg\\:hidden, aside, header, button, .actions-cell {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .table-container {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #e5e7eb !important;
            padding: 8px !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid black;
            padding-bottom: 10px;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      {/* Header for PDF Printing */}
      <div className="print-header text-right">
        <h1 className="text-2xl font-black">{settings.departmentName}</h1>
        <h2 className="text-lg font-bold">{settings.sectionName} - {settings.branchName}</h2>
        <p className="text-sm mt-2">تقرير سجل الطلبات - التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
      </div>

      {/* Table Actions Header */}
      <div className={`no-print px-4 lg:px-8 py-4 lg:py-5 flex items-center justify-between rounded-3xl border-2 ${settings.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
          <span className={`text-[10px] lg:text-xs font-black uppercase tracking-widest ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            المعروض: {requests.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-lg ${
              settings.darkMode 
                ? 'bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white border border-gray-600' 
                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100'
            }`}
          >
            <Printer size={14} />
            <span className="hidden sm:inline">تصدير PDF</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-lg ${
              settings.darkMode 
                ? 'bg-gray-700 text-blue-400 hover:bg-blue-600 hover:text-white border border-gray-600' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100'
            }`}
          >
            <Download size={14} />
            <span className="hidden sm:inline">تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`table-container overflow-hidden rounded-[2.5rem] border-2 ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-2xl`}>
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className={`${settings.darkMode ? 'bg-gray-700/50 text-gray-400' : 'bg-gray-50 text-gray-500'} text-xs font-black border-b dark:border-gray-700 uppercase tracking-widest`}>
              <th className="px-8 py-7">مقدم الطلب</th>
              <th className="px-8 py-7">المركبة والشركة</th>
              <th className="px-8 py-7">المفاتحة</th>
              <th className="px-8 py-7">الاستحقاق</th>
              <th className="px-8 py-7">الحالة التنفيذية</th>
              <th className="no-print actions-cell px-8 py-7 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${settings.darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {requests.map((req) => {
              const status = getRowStatus(req);
              const isCompleted = status === 'COMPLETED';
              const isStopped = status === 'STOPPED';
              const isOverdue = status === 'OVERDUE';
              
              return (
                <tr key={req.id} className={`transition-all duration-300 relative group ${isStopped ? 'bg-red-50/10 border-r-8 border-red-600' : isOverdue ? 'bg-orange-50/10 border-r-8 border-orange-500' : (settings.darkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50')}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black text-xl shadow-lg transition-transform group-hover:scale-110 ${isStopped ? 'bg-red-700 text-white' : isOverdue ? 'bg-orange-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`} style={(!isStopped && !isOverdue && !isCompleted) ? { backgroundColor: settings.primaryColor } : {}}>
                        {req.applicantName.charAt(0)}
                      </div>
                      <div>
                        <div className={`font-black text-base ${settings.darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{req.applicantName}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-1.5 font-bold">
                          <Calendar size={13} /> {req.requestDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`text-sm font-black ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{req.vehicleNumber}</div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase">{req.company}</div>
                  </td>
                  <td className="px-8 py-6">
                    {req.correspondence.status === RequestStatus.DONE ? (
                      <span className="text-[10px] font-black bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-lg">كتاب: {req.correspondence.bookNumber}</span>
                    ) : <span className="text-gray-400 text-[11px] italic">بانتظار...</span>}
                  </td>
                  <td className="px-8 py-6">
                    {req.correspondence.status === RequestStatus.DONE && req.correspondence.bookDate ? (
                      <div className={`text-xs font-black flex items-center gap-2 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                        {calculateDueDate(req.correspondence.bookDate, req.settlementDays).toLocaleDateString('ar-EG')}
                      </div>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black px-5 py-2 rounded-2xl border-2 flex items-center w-fit gap-2.5 ${isStopped ? 'bg-red-700 text-white border-red-800' : isCompleted ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                      {isStopped ? <StopCircle size={14} /> : isCompleted ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {isStopped ? 'موقوفة' : isCompleted ? 'منجزة كلياً' : isOverdue ? 'متجاوزة' : 'قيد الإجراء'}
                    </span>
                  </td>
                  <td className="no-print actions-cell px-8 py-6 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={(e) => handleViewBtn(e, req)} className="p-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-200 transition-all shadow-sm" title="مشاهدة"><Eye size={16} /></button>
                      <button onClick={(e) => handleEditBtn(e, req)} className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" title="تعديل"><Edit2 size={16} /></button>
                      <button onClick={(e) => handleDeleteBtn(e, req.id)} className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm" title="حذف"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div className="no-print py-20 text-center flex flex-col items-center gap-4 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-full text-gray-300">
            <Search size={48} />
          </div>
          <p className="text-gray-400 font-black">لا توجد سجلات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default RequestTable;
