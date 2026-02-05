
import React, { useState } from 'react';
import { supabase } from '../supabase';
import { LogIn, UserPlus, Mail, Lock, Loader2, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { SystemSettings } from '../types';

interface AuthProps {
  settings: SystemSettings;
}

const Auth: React.FC<AuthProps> = ({ settings }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 text-right rtl ${settings.darkMode ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
        <div className={`max-w-md w-full rounded-[2.5rem] shadow-2xl p-10 text-center ${settings.darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}>
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h2 className="text-2xl font-black mb-4">تفقد بريدك الإلكتروني</h2>
          <p className="text-gray-500 mb-8">لقد أرسلنا رابط تفعيل إلى بريدك. يرجى تفعيل الحساب للتمكن من الدخول.</p>
          <button onClick={() => setSuccess(false)} className="w-full bg-primary text-white py-4 rounded-2xl font-black" style={{backgroundColor: settings.primaryColor}}>العودة</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 text-right rtl ${settings.darkMode ? 'bg-[#0f172a]' : 'bg-[#f1f5f9]'}`}>
      <div className={`max-w-md w-full rounded-[2.5rem] shadow-2xl overflow-hidden border-4 ${settings.darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-white'}`}>
        <div className="p-8 text-center text-white" style={{ backgroundColor: settings.primaryColor }}>
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Building2 size={40} className="text-blue-900" />
          </div>
          <h1 className="text-2xl font-black">نظام إلغاء الاعتمادية</h1>
          <p className="opacity-80 text-xs font-bold uppercase">{settings.departmentName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold border-r-4 border-red-500 flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input required type="email" placeholder="البريد الإلكتروني" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input required type="password" placeholder="كلمة المرور" className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl pr-12 pl-4 py-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2" style={{ backgroundColor: settings.primaryColor }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {mode === 'login' ? 'دخول' : 'إنشاء حساب'}
          </button>

          <button type="button" onClick={handleGoogleSignIn} className="w-full border-2 border-gray-100 dark:border-gray-800 py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
             متابعة باستخدام Google
          </button>

          <div className="text-center">
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-xs font-black text-gray-400 hover:text-primary">
              {mode === 'login' ? 'ليس لديك حساب؟ اشترك الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
