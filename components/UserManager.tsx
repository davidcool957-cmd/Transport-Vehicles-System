
import React, { useState } from 'react';
import { UserPlus, Pencil, Trash2, Shield, User as UserIcon, X, Save, CheckCircle, AlertTriangle, Briefcase } from 'lucide-react';
import { User, SystemSettings } from '../types';

interface UserManagerProps {
  users: User[];
  onUpdate: (users: User[]) => void;
  settings: SystemSettings;
}

const UserManager: React.FC<UserManagerProps> = ({ users, onUpdate, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    username: '',
    role: 'editor'
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', role: 'editor' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string, role: string) => {
    e.preventDefault();
    e.stopPropagation();

    // حماية: منع حذف آخر مدير نظام
    const adminCount = users.filter(u => u.role === 'admin' || u.role === 'specialist').length;
    if ((role === 'admin' || role === 'specialist') && adminCount <= 1) {
      alert('لا يمكن سحب صلاحيات الموظف الأخير ذو الصلاحيات الكاملة لضمان استمرار الوصول للوحة التحكم.');
      return;
    }

    if (window.confirm('هل أنت متأكد من سحب صلاحيات هذا الموظف نهائياً؟')) {
      const updatedUsers = users.filter(u => u.id !== id);
      onUpdate(updatedUsers);
      showToast('تم سحب الصلاحيات وحذف الحساب بنجاح', 'success');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.username?.trim()) {
      alert('يرجى ملء جميع الحقول الأساسية');
      return;
    }

    let updatedUsers: User[];

    if (editingUser) {
      updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData } as User 
          : u
      );
      showToast('تم تحديث بيانات الموظف بنجاح');
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || '',
        username: formData.username || '',
        role: (formData.role as any) || 'editor',
        addedDate: new Date().toISOString()
      };
      updatedUsers = [...users, newUser];
      showToast('تم اعتماد الموظف الجديد في النظام');
    }

    onUpdate(updatedUsers);
    setIsModalOpen(false);
  };

  const showToast = (message: string, type: 'success' | 'warning' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-10 left-10 text-white px-8 py-4 rounded-2xl font-black shadow-2xl z-[200] animate-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 border-r-4 ${
      type === 'success' ? 'bg-gray-900 border-green-500' : 'bg-red-600 border-red-800'
    }`;
    toast.innerHTML = `
      ${type === 'success' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'}
      ${message}
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'fade-out', 'slide-out-to-bottom-5');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام الكامل';
      case 'specialist': return 'الموظف المختص (صلاحيات كاملة)';
      case 'editor': return 'موظف إدخال';
      case 'viewer': return 'مشاهد فقط';
      default: return role;
    }
  };

  const getRoleStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-100 text-amber-700';
      case 'specialist': return 'bg-indigo-100 text-indigo-700';
      case 'editor': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="text-right">
          <h2 className={`text-4xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>إدارة شؤون الموظفين</h2>
          <p className="text-sm text-gray-500 font-bold mt-2 opacity-70">التحكم في صلاحيات الوصول والحسابات الإدارية المركزية</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-primary hover:opacity-90 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-4 transition-all active:scale-95"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <span>إضافة كادر جديد</span>
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <UserPlus size={16} strokeWidth={3} />
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((user) => (
          <div 
            key={user.id} 
            className={`group bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-sm border ${settings.darkMode ? 'border-gray-700' : 'border-gray-100'} hover:border-primary hover:shadow-2xl transition-all duration-500 relative overflow-hidden`}
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

            <div className="flex w-full items-start justify-between mb-10 relative z-10">
              <div 
                className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-2xl transform group-hover:rotate-6 transition-transform`}
                style={{ 
                  backgroundColor: user.role === 'admin' ? '#f59e0b' : (user.role === 'specialist' ? '#6366f1' : settings.primaryColor),
                  boxShadow: `0 20px 40px -10px ${user.role === 'admin' ? '#f59e0b44' : (user.role === 'specialist' ? '#6366f144' : settings.primaryColor + '44')}`
                }}
              >
                {user.name.charAt(0)}
              </div>

              <div className="flex-1 text-right pr-8 pt-2">
                <h3 className={`text-2xl font-black mb-3 ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</h3>
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black ${getRoleStyle(user.role)}`}>
                  {user.role === 'admin' ? <Shield size={14} /> : (user.role === 'specialist' ? <Briefcase size={14} /> : <UserIcon size={14} />)}
                  <span>{getRoleLabel(user.role)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8 text-right px-2">
               <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span>اسم المستخدم:</span>
                  <span className="text-gray-600 dark:text-gray-300">@{user.username}</span>
               </div>
               <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span>تاريخ الانضمام:</span>
                  <span className="text-gray-600 dark:text-gray-300">{new Date(user.addedDate).toLocaleDateString('ar-EG')}</span>
               </div>
            </div>

            <div className={`w-full pt-8 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-50'} flex items-center justify-between gap-4`}>
              <button 
                onClick={() => handleOpenEdit(user)}
                className="flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-primary hover:text-white font-black text-xs transition-all"
                style={{ '--hover-bg': settings.primaryColor } as any}
              >
                <Pencil size={16} />
                <span>تعديل</span>
              </button>
              <button 
                onClick={(e) => handleDelete(e, user.id, user.role)}
                className="flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl bg-gray-50 dark:bg-gray-700 text-red-500 hover:bg-red-600 hover:text-white font-black text-xs transition-all"
              >
                <Trash2 size={16} />
                <span>سحب الصلاحية</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className={`w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-4 border-white dark:border-gray-700 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-10 flex items-center justify-between border-b dark:border-gray-700">
              <h2 className={`text-2xl font-black ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingUser ? 'تحديث بيانات الكادر' : 'إضافة موظف جديد'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all">
                <X size={28} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-8 text-right">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">الاسم الكامل للموظف</label>
                <input 
                  required
                  type="text" 
                  placeholder="مثلاً: محمد علي حسن"
                  className={`w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all dark:text-white`}
                  style={{ '--tw-ring-color': settings.primaryColor } as any}
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">اسم المستخدم (Username)</label>
                <input 
                  required
                  type="text" 
                  placeholder="admin_2024"
                  className={`w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all dark:text-white`}
                  value={formData.username || ''}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">مستوى الصلاحية</label>
                <select 
                  className={`w-full bg-gray-50 dark:bg-gray-700 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none cursor-pointer dark:text-white`}
                  value={formData.role || 'editor'}
                  onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="admin">مدير نظام (صلاحيات كاملة)</option>
                  <option value="specialist">الموظف المختص (صلاحيات كاملة)</option>
                  <option value="editor">موظف (إدخال وتعديل)</option>
                  <option value="viewer">مشاهد (للعرض فقط)</option>
                </select>
              </div>
              
              <div className="pt-8 flex gap-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <Save size={20} />
                  <span>{editingUser ? 'حفظ التعديلات' : 'اعتماد الموظف'}</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-500 py-4 rounded-2xl font-black text-sm hover:bg-gray-200 transition-all"
                >
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
