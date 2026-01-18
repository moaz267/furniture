import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // مصفوفة القائمة الجانبية - تم تعديل المسارات لتطابق App.tsx بالظبط
  const menuItems = [
    { 
      title: 'Orders', 
      path: '/admin/orders', 
      icon: ShoppingCart 
    },
    { 
      title: 'Products', 
      path: '/admin/products', 
      icon: Package 
    },
    { 
      title: 'Messages', 
      path: '/admin/messages', 
      icon: MessageSquare 
    },
    { 
      title: 'Roles Management', 
      path: '/admin/AdminRoles', // التأكد من حالة الأحرف الكبيرة
      icon: ShieldCheck 
    },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {/* Sidebar - القائمة الجانبية */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo - الشعار */}
          <div className="p-6 flex items-center justify-between">
            <span className={cn("font-serif font-bold text-xl text-amber-500", !isSidebarOpen && "lg:hidden")}>
              Capital Admin
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Navigation Links - الروابط */}
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors group",
                    isActive 
                      ? "bg-amber-600 text-white" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-amber-500")} />
                  <span className={cn("font-medium", !isSidebarOpen && "lg:hidden")}>
                    {item.title}
                  </span>
                  {isActive && isSidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button - زر الخروج */}
          <div className="p-4 border-t border-slate-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-400/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className={cn(!isSidebarOpen && "lg:hidden")}>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header - الرأس العلوي */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 lg:px-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-4"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Welcome</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;