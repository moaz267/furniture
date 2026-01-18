import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // أضفنا الـ Navigate هنا
import { UserPlus, Trash2, Shield, Crown, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'owner' | 'user';
  email?: string;
}

const roleConfig = {
  owner: { label: 'Owner', icon: Crown, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

const AdminRoles = () => {
  const navigate = useNavigate(); // تعريف الـ navigate لمنع مشاكل التوجيه
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'owner'>('admin');
  const [isAdding, setIsAdding] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      setIsLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error("يرجى تسجيل الدخول للوصول لهذه الصفحة");
        navigate('/admin-login'); // التوجيه لصفحة الدخول لو مفيش جلسة
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      // السماح فقط للـ owner برؤية هذه الصفحة
      if (roleError || roleData?.role !== 'owner') {
        setIsOwner(false);
        toast.error("هذه الصلاحية للمالك فقط");
        // اختياري: navigate('/admin/orders'); 
      } else {
        setIsOwner(true);
        await fetchUserRoles();
      }
      
      setIsLoading(false);
    };

    checkAuthAndFetch();
  }, [navigate]);

  const fetchUserRoles = async () => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('role', { ascending: true });

    if (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to fetch user roles');
      return;
    }
    setUserRoles(data || []);
  };

  const addUserRole = async (e: React.FormEvent) => {
    e.preventDefault(); // منع الفورم من عمل Refresh للصفحة (سبب رئيسي للـ 404)
    
    if (!newUserId.trim()) {
      toast.error('Please enter a User ID');
      return;
    }

    setIsAdding(true);
    try {
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', newUserId)
        .eq('role', newRole)
        .maybeSingle();

      if (existing) {
        toast.error('This user already has this role');
        setIsAdding(false);
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: newUserId, role: newRole });

      if (error) throw error;

      toast.success('Role added successfully');
      setNewUserId('');
      fetchUserRoles();
    } catch (error) {
      console.error('Error adding role:', error);
      toast.error('Failed to add role.');
    } finally {
      setIsAdding(false);
    }
  };

  const removeUserRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast.success('Role removed successfully');
      setUserRoles(prev => prev.filter(r => r.id !== roleId));
    } catch (error) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="animate-spin h-10 w-10 text-gold" />
        </div>
      </AdminLayout>
    );
  }

  if (!isOwner) {
    return (
      <AdminLayout>
        <div className="p-6 lg:p-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-16 h-16 text-red-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-red-800">Access Denied</h2>
              <p className="text-red-600 max-w-md">
                عذراً، هذه الصفحة مخصصة لمالك الموقع فقط (Owner). 
                حسابك الحالي لا يمتلك الصلاحيات الكافية.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-red-200 text-red-700 hover:bg-red-100"
                onClick={() => navigate('/admin/orders')}
              >
                العودة للوحة التحكم
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const owners = userRoles.filter(r => r.role === 'owner');
  const admins = userRoles.filter(r => r.role === 'admin');

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold">User Roles Management</h1>
          <p className="text-muted-foreground mt-1">إدارة صلاحيات المديرين والملاك</p>
        </div>

        <Card className="mb-8 border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-gold" />
              Add New Role
            </CardTitle>
            <CardDescription>
              Assign privileges by User ID (UUID)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* تم تحويلها لفورم مع منع التحديث التلقائي */}
            <form onSubmit={addUserRole} className="flex flex-col sm:row gap-4">
              <Input
                placeholder="User ID (UUID)"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="flex-1"
                required
              />
              <Select value={newRole} onValueChange={(v: 'admin' | 'owner') => setNewRole(v)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isAdding} className="bg-gold hover:bg-gold/90 text-charcoal">
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Add Role
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Owners List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Crown className="w-5 h-5" />
                Owners ({owners.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {owners.length === 0 && <p className="text-sm text-muted-foreground italic">No owners assigned</p>}
                {owners.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                    <div className="flex flex-col">
                      <code className="text-[10px] text-amber-800 bg-amber-100 px-1 rounded w-fit mb-1">ID: {role.user_id.slice(0, 18)}...</code>
                      <span className="text-sm font-medium">Owner Account</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف صلاحية الأونر؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            هذا الإجراء سيقوم بسحب كامل صلاحيات التحكم من هذا المستخدم.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-white" onClick={() => removeUserRole(role.id)}>تأكيد الحذف</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admins List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Shield className="w-5 h-5" />
                Admins ({admins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {admins.length === 0 && <p className="text-sm text-muted-foreground italic">No admins assigned</p>}
                {admins.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <div className="flex flex-col">
                      <code className="text-[10px] text-blue-800 bg-blue-100 px-1 rounded w-fit mb-1">ID: {role.user_id.slice(0, 18)}...</code>
                      <span className="text-sm font-medium">Admin Staff</span>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-red-50" onClick={() => removeUserRole(role.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;