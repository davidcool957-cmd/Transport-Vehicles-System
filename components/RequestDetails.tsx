
import React from 'react';
import { 
  X, Printer, User, Car, Building, 
  Calendar, FileText, CheckCircle2, 
  Clock, AlertCircle, StickyNote, MapPin,
  Timer, AlertOctagon
} from 'lucide-react';
import { VehicleRequest, SystemSettings, RequestStatus } from '../types';

interface RequestDetailsProps {
  request: VehicleRequest;
  onClose: () => void;
  settings: SystemSettings;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({ request, onClose, settings }) => {
  const calculateDueDate = (bookDate: string, days: number) => {
    const date = new Date(bookDate);
    date.setDate(date.getDate() + days);
    return date;
  };

  const isOverdue = request.correspondence.status === RequestStatus.DONE && 
                   request.correspondence.bookDate &&
                   calculateDueDate(request.correspondence.bookDate, request.settlementDays) < new Date() &&
                   request.cancellation.status === RequestStatus.PENDING;

  const isStopped = request.cancellation.status === RequestStatus.STOPPED;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className={`w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white dark:border-gray-700 animate-in zoom-in-95 duration-200 ${settings.darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        
        {/* Header */}
        <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 no-print">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl ${isStopped ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`} style={!isStopped ? { color: settings.primaryColor } : {}}>
              <FileText size={28} />
            </div>
            <div className="text-right">
              <h2 className={`text-2xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>تفاصيل المعاملة</h2>
              <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">كود المعاملة: #{request.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all">
            <X size={28} />
          </button>
        </div>

        {/* Content Area for Printing */}
        <div className="p-8 lg:p-10 overflow-y-auto max-h-[70vh] space-y-10 rtl text-right">
          
          {/* Status Banner */}
          <div className={`p-6 rounded-3xl border-2 flex items-center gap-6 ${
            isStopped ? 'bg-red-600 border-red-700 text-white shadow-xl' :
            request.cancellation.status === RequestStatus.DONE ? 'bg-green-50 border-green-200 text-green-700' :
            isOverdue ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <div className={`p-3 ${isStopped ? 'bg-white/20' : 'bg-white/50'} rounded-2xl`}>
              {isStopped ? <AlertOctagon size={32} /> :
               request.cancellation.status === RequestStatus.DONE ? <CheckCircle2 size={32} /> :
               isOverdue ? <Clock size={32} className="animate-pulse" /> : <Clock size={32} />}
            </div>
            <div>
              <h3 className="font-black text-lg">
                الحالة الحالية: {
                  isStopped ? 'المعاملة موقوفة إدارياً' :
                  request.cancellation.status === RequestStatus.DONE ? 'تم إلغاء الاعتمادية بنجاح' :
                  isOverdue ? 'المعاملة متجاوزة لفترة الاستحقاق' : 'المعاملة قيد المراجعة والمتابعة'
                }
              </h3>
              <p className={`text-sm font-bold mt-1 ${isStopped ? 'text-white/80' : 'opacity-70'}`}>
                {isStopped ? 'تم اتخاذ قرار بإيقاف العمل على هذه المعاملة نهائياً.' : 'تحديث النظام التلقائي بناءً على معطيات الإدخال.'}
              </p>
            </div>
          </div>

          {/* Reason Section if Stopped */}
          {isStopped && (
            <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-3xl border-r-8 border-red-600 shadow-inner animate-in slide-in-from-right-4">
               <h4 className="text-sm font-black text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                 <AlertOctagon size={18} /> أسباب الإيقاف الإداري
               </h4>
               <p className="text-base font-black text-gray-900 dark:text-gray-100 leading-relaxed bg-white/50 dark:bg-black/20 p-6 rounded-2xl">
                 {request.cancellation.stopReason || "لم يتم تحديد سبب إيقاف مفصل."}
               </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"><User size={20} /></div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">اسم مقدم الطلب</label>
                  <p className={`font-black text-base ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{request.applicantName}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"><Car size={20} /></div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">رقم المركبة واللوحة</label>
                  <p className={`font-black text-base ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{request.vehicleNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"><Building size={20} /></div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">الشركة المستفيدة</label>
                  <p className={`font-black text-base ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{request.company}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"><Calendar size={20} /></div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">تاريخ تقديم الطلب</label>
                  <p className={`font-black text-base ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{request.requestDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"><MapPin size={20} /></div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">عائدية المركبة</label>
                  <p className={`font-black text-base ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{request.ownership}</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="dark:border-gray-800" />

          {/* المسار الإداري */}
          <div>
            <h4 className="text-sm font-black text-gray-400 uppercase mb-6 flex items-center gap-2">
              <Clock size={16} /> المسار الإداري للطلب
            </h4>
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${request.correspondence.status === RequestStatus.DONE ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">خطوة المفاتحة (إصدار الكتاب الرسمي)</p>
                  {request.correspondence.status === RequestStatus.DONE ? (
                    <p className="text-xs text-gray-500 mt-1">تمت المفاتحة بالكتاب ذي الرقم <span className="text-primary font-black" style={{color: settings.primaryColor}}>{request.correspondence.bookNumber}</span> بتاريخ {request.correspondence.bookDate}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1 italic">بانتظار إصدار الكتاب الرسمي للمخاطبة.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${request.financialSettlement.status === RequestStatus.DONE ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-black text-sm">تسوية الرسوم المالية</p>
                  {request.financialSettlement.status === RequestStatus.DONE ? (
                    <p className="text-xs text-gray-500 mt-1">تم تسديد الرسوم بالوصل رقم <span className="text-green-600 font-black">{request.financialSettlement.bookNumber}</span> بتاريخ {request.financialSettlement.bookDate}.</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1 italic">بانتظار تأكيد الاستيفاء المالي.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isStopped ? 'bg-red-600 text-white' :
                  request.cancellation.status === RequestStatus.DONE ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {isStopped ? <AlertOctagon size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <div className="flex-1">
                  <p className={`font-black text-sm ${isStopped ? 'text-red-700' : ''}`}>قرار الإلغاء النهائي</p>
                  {isStopped ? (
                    <p className="text-xs text-red-600 mt-1 font-black">المعاملة تم إيقافها إدارياً.</p>
                  ) : request.cancellation.status === RequestStatus.DONE ? (
                    <p className="text-xs text-gray-500 mt-1">صدر قرار الإلغاء بالأمر رقم <span className="text-purple-600 font-black">{request.cancellation.bookNumber}</span> بتاريخ {request.cancellation.bookDate}.</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1 italic">بانتظار اتخاذ القرار النهائي.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t dark:border-gray-800 flex items-center justify-between no-print">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 px-6 py-3 rounded-2xl text-xs font-black text-gray-600 dark:text-gray-300 hover:border-primary transition-all active:scale-95"
          >
            <Printer size={18} /> طباعة تفاصيل المعاملة
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-3 rounded-2xl bg-primary text-white text-sm font-black shadow-xl transition-all active:scale-95"
            style={{ backgroundColor: settings.primaryColor }}
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;
