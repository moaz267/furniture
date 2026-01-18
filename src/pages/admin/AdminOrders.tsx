import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Loader2, Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from '@/components/ui/alert-dialog';

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  total_price: number;
  status: string;
  created_at: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await checkUserRole();
      await fetchOrders();
    };
    initialize();
  }, []);

  // معرفة هل المستخدم الحالي Owner أم Admin
  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      setUserRole(data?.role || 'admin');
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('خطأ في تحميل الطلبات');
    } else {
      setOrders(data || []);
    }
    setIsLoading(false);
  };

  // دالة تحديث حالة الطلب (متاحة للكل)
  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('فشل تحديث الحالة');
    } else {
      toast.success(`تم تحديث الطلب إلى ${newStatus}`);
      fetchOrders();
    }
  };

  // دالة حذف الطلب (للأونر فقط)
  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast.success('تم حذف الطلب نهائياً');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      toast.error('فشل في عملية الحذف');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">إدارة طلبات العملاء</h1>
            <p className="text-muted-foreground mt-1">عرض حالات الطلبات والتحكم بها</p>
          </div>
          <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={isLoading ? "animate-spin w-4 h-4" : "w-4 h-4"} />
            تحديث
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>العميل</TableHead>
                  <TableHead>الهاتف / العنوان</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.customer_name}</TableCell>
                    <TableCell className="text-sm">
                      <div className="text-slate-600">{order.phone}</div>
                      <div className="text-slate-400 text-xs">{order.address}</div>
                    </TableCell>
                    <TableCell>{order.total_price} ج.م</TableCell>
                    <TableCell>
                      <Badge className={
                        order.status === 'approved' ? "bg-green-100 text-green-700" : 
                        order.status === 'rejected' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }>
                        {order.status === 'pending' ? 'قيد الانتظار' : order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* أزرار التحكم العادية للأدمن والأونر */}
                        <Button 
                          size="icon" variant="outline" className="text-green-600 h-8 w-8"
                          onClick={() => updateStatus(order.id, 'approved')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" variant="outline" className="text-red-500 h-8 w-8"
                          onClick={() => updateStatus(order.id, 'rejected')}
                        >
                          <X className="w-4 h-4" />
                        </Button>

                        {/* زر الحذف الإضافي يظهر للأونر فقط */}
                        {userRole === 'owner' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="text-slate-400 hover:text-red-600 h-8 w-8">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف الطلب نهائياً؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                  أنت الآن تحذف سجل طلب "{order.customer_name}". لا يمكن استعادة البيانات بعد الحذف.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteOrder(order.id)} className="bg-red-600 text-white hover:bg-red-700">
                                  تأكيد الحذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;