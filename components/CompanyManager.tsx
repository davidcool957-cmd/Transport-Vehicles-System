
import React, { useState } from 'react';
import { Plus, Building2, Trash2, Calendar } from 'lucide-react';
import { Company, SystemSettings } from '../types';
import { supabase } from '../supabase';

interface CompanyManagerProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  settings: SystemSettings;
}

const CompanyManager: React.FC<CompanyManagerProps> = ({ companies, setCompanies, settings }) => {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-10 left-10 px-8 py-4 rounded-2xl font-black shadow-2xl z-[200] animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 border-r-4 ${
      type === 'success' ? 'bg-gray-900 text-white border-green-500' : 'bg-red-600 text-white border-red-800'
    }`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const addCompany = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      showToast('يرجى إدخال اسم الشركة أولاً', 'error');
      return;
    }

    if (companies.some(c => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      showToast('هذه الشركة مسجلة بالفعل', 'error');
      return;
    }

    setLoading(true);
    const newCompany: Company = {
      id: Math.random().toString(36).substr(2, 9),
      name: trimmedName,
      addedDate: new Date().toISOString().split('T')[0]
    };

    try {
      const { error } = await supabase.from('companies').insert([newCompany]);
      if (error) throw error;
      
      setCompanies(prev => [...prev, newCompany]);
      setNewName('');
      showToast('تمت إضافة الشركة بنجاح');
    } catch (err) {
      console.error(err);
      showToast('فشل في إضافة الشركة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteCompany = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف شركة "${name}"؟`)) {
      try {
        const { error } = await supabase.from('companies').delete().eq('id', id);
        if (error) throw error;
        
        setCompanies(prev => prev.filter(c => c.id !== id));
        showToast('تم حذف الشركة');
      } catch (err) {
        console.error(err);
        showToast('فشل في حذف الشركة', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>إدارة الشركات المعتمدة</h2>
          <p className="text-gray-500 mt-2 font-bold opacity-70">تحديد الشركات التي تظهر في نماذج تقديم الطلبات وتتبعها</p>
        </div>
      </div>

      <div className={`p-8 lg:p-10 rounded-[2.5rem] border shadow-2xl ${settings.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row gap-5 mb-10">
          <div className="flex-1 relative">
            <Building2 size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              disabled={loading}
              type="text" 
              placeholder="أدخل اسم الشركة الجديدة هنا..." 
              className={`w-full pr-14 pl-6 py-4 rounded-2xl border-2 outline-none font-bold text-sm transition-all focus:border-blue-500 ${
                settings.darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
              }`}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCompany()}
            />
          </div>
          <button 
            disabled={loading}
            onClick={addCompany}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus size={20} />
            {loading ? 'جاري الإضافة...' : 'إضافة شركة جديدة'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <div 
              key={company.id} 
              className={`flex items-center justify-between p-6 rounded-[1.75rem] border-2 transition-all group ${
                settings.darkMode 
                  ? 'bg-gray-700/30 border-gray-600 hover:border-blue-500 hover:bg-gray-700/50' 
                  : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-xl'
              }`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-inner ${
                  settings.darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Building2 size={26} />
                </div>
                <div>
                  <h4 className={`text-base font-black ${settings.darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{company.name}</h4>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1.5 font-bold uppercase tracking-widest">
                    <Calendar size={12} /> {company.addedDate}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deleteCompany(company.id, company.name)}
                className={`p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${
                  settings.darkMode 
                    ? 'bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white' 
                    : 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white'
                }`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyManager;
