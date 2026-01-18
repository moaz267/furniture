import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogIn, UserPlus, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // --- إنشاء حساب جديد ---
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: { 
              full_name: fullName.trim() 
            },
          },
        });

        if (error) throw error;

        toast.success("تم إنشاء الحساب بنجاح! جاري تحويلك...");
        // الانتظار ثانية واحدة عشان اليوزر يلحق يقرأ الرسالة
        setTimeout(() => navigate("/"), 1500);

      } else {
        // --- تسجيل دخول حساب موجود ---
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        toast.success("مرحباً بك مرة أخرى!");
        navigate("/"); 
      }
    } catch (error: any) {
      // ترجمة بسيطة لبعض الأخطاء الشائعة من سوبابيز
      let message = error.message;
      if (message.includes("User already registered")) message = "هذا الإيميل مسجل بالفعل";
      if (message.includes("Invalid login credentials")) message = "خطأ في الإيميل أو كلمة المرور";
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] p-4 font-sans text-right" dir="rtl">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
        
        {/* الهيدر */}
        <div className="text-center mb-10">
          <div className="bg-[#C5A059] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3 shadow-lg shadow-[#C5A059]/30">
            {isSignUp ? <UserPlus className="text-white w-8 h-8" /> : <LogIn className="text-white w-8 h-8" />}
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            {isSignUp ? "انضم إلينا" : "دخول الإدارة والعملاء"}
          </h1>
          <p className="text-gray-500">
            {isSignUp ? "سجل حسابك في Capital Furniture" : "أهلاً بك في عالم الأثاث الفاخر"}
          </p>
        </div>

        {/* الفورم */}
        <form onSubmit={handleAuth} className="space-y-5">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 mr-1">الاسم بالكامل</label>
              <div className="relative">
                <Input
                  placeholder="السيد الحناوي"
                  className="pr-10 h-12 border-gray-200 focus:border-[#C5A059] focus:ring-[#C5A059] rounded-xl"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 mr-1">البريد الإلكتروني</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="example@gmail.com"
                className="pr-10 h-12 border-gray-200 focus:border-[#C5A059] focus:ring-[#C5A059] rounded-xl text-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 mr-1">كلمة المرور</label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                className="pr-10 h-12 border-gray-200 focus:border-[#C5A059] focus:ring-[#C5A059] rounded-xl text-left"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <Button 
            disabled={loading} 
            className="w-full bg-[#C5A059] hover:bg-[#A38446] text-white h-12 rounded-xl text-lg font-bold shadow-lg shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "إنشاء حساب" : "تسجيل الدخول"}</span>
                <ArrowRight className="w-5 h-5 rotate-180" />
              </>
            )}
          </Button>
        </form>

        {/* التبديل بين الحالات */}
        <div className="mt-8 text-center border-t pt-6 border-gray-100">
          <p className="text-gray-600 text-sm">
            {isSignUp ? "لديك حساب بالفعل؟" : "ليس لديك حساب بعد؟"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#C5A059] font-bold mr-2 hover:underline transition-all"
            >
              {isSignUp ? "سجل دخولك من هنا" : "أنشئ حساباً الآن"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;