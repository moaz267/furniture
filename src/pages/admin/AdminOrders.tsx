import { useState, useEffect } from 'react';
import { Eye, Check, X, MessageCircle, Clock, ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Download, ExternalLink, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  awaiting_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  payment_failed: 'Payment Failed',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  awaiting_payment: 'bg-orange-100 text-orange-800 border-orange-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  paid: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
  payment_failed: 'bg-red-100 text-red-800 border-red-200',
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setOrders(data || []);
    setIsLoading(false);
  };

  const loadScreenshot = async (path: string) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('payment-screenshots').createSignedUrl(path, 3600);
    if (!error && data) setScreenshotUrl(data.signedUrl);
  };

  const openDetails = async (order: any) => {
    setSelectedOrder(order);
    setScreenshotUrl(null);
    setRejectReason('');
    setIsDetailsOpen(true);
    if (order.screenshot_url) await loadScreenshot(order.screenshot_url);
  };

  const updateStatus = async (status: string, reason?: string) => {
    if (!selectedOrder) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('orders').update({ 
        order_status: status,
        admin_notes: reason || null
      }).eq('id', selectedOrder.id);

      if (error) throw error;
      toast.success("تم التحديث");
      setIsDetailsOpen(false);
      fetchOrders();
    } catch (err) { toast.error("خطأ في التحديث"); }
    finally { setIsProcessing(false); }
  };

  // --- دالة الحذف الرسمية للأونر ---
  const deleteOrder = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من الحذف النهائي من السيرفر؟ (لصاحب الصلاحية فقط)")) return;
    
    setIsProcessing(true);
    const toastId = toast.loading("جاري محاولة الحذف...");

    try {
      // حذف التايم لاين المرتبط بالطلب أولاً لتجنب تعارض البيانات
      await supabase.from('order_timeline').delete().eq('order_id', id);
      
      // حذف الطلب الفعلي
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success("تم الحذف بنجاح من قاعدة البيانات", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("عفواً، لا تملك صلاحية الحذف من السيرفر. يرجى مراجعة إعدادات RLS في سوبابيز.", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportExcel = () => {
    const data = orders.map(o => ({
      "رقم الطلب": o.id.slice(0,8),
      "العميل": o.customer_name,
      "الهاتف": o.customer_phone,
      "الإجمالي": o.total,
      "الحالة": statusLabels[o.order_status],
      "التاريخ": format(new Date(o.created_at), 'yyyy-MM-dd')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Orders.xlsx`);
  };

  if (isLoading) return <div className="p-20 text-center font-serif text-xl animate-pulse text-gold">جاري التحميل...</div>;

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gold/10">
          <div className="text-right">
            <h1 className="text-3xl font-black text-gray-800">إدارة الطلبات (الأدمن)</h1>
            <p className="text-muted-foreground text-lg">إجمالي الطلبات: {orders.length}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/products')} className="bg-gold hover:bg-gold/90 text-white rounded-xl h-12 px-6">المنتجات</Button>
            <Button onClick={exportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-6">تصدير إكسيل</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:border-gold/30 transition-all flex flex-col md:flex-row justify-between items-center gap-4 group">
              <div className="flex items-center gap-4 w-full">
                <div className="bg-gold/10 p-3 rounded-full text-gold group-hover:bg-gold group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">{order.customer_name}</p>
                  <div className="flex gap-2 items-center mt-1">
                    <Badge className={cn(statusColors[order.order_status])}>{statusLabels[order.order_status]}</Badge>
                    <span className="text-xs text-gray-400">#{order.id.slice(0,8).toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <p className="font-black text-xl text-gold">{order.total} EGP</p>
                <div className="flex gap-2">
                  <Button onClick={() => openDetails(order)} variant="outline" size="sm" className="rounded-lg h-10 px-4">التفاصيل</Button>
                  <Button 
                    onClick={() => deleteOrder(order.id)} 
                    disabled={isProcessing}
                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg h-10 w-10 p-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl rounded-[2rem] p-0" dir="rtl">
          {selectedOrder && (
            <div className="p-8 space-y-6 text-right">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-black text-gray-800">تفاصيل الطلب</h2>
                <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}><X className="w-6 h-6" /></Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-gold font-bold mb-2">معلومات العميل:</p>
                  <p className="text-xl font-bold">{selectedOrder.customer_name}</p>
                  <p className="text-gray-600">{selectedOrder.customer_phone}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-gold font-bold mb-2">العنوان:</p>
                  <p className="text-xl font-bold">{selectedOrder.city}</p>
                  <p className="text-gray-600">{selectedOrder.shipping_address}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-bold">صورة إثبات الدفع:</p>
                {screenshotUrl ? (
                  <img src={screenshotUrl} className="w-full h-auto max-h-[450px] object-contain rounded-2xl border shadow-sm" />
                ) : <div className="p-10 bg-gray-50 rounded-2xl border-2 border-dashed text-center text-gray-400">لا يوجد إثبات مرفق</div>}
              </div>

              {selectedOrder.order_status === 'awaiting_payment' && (
                <div className="bg-gold/5 border-2 border-gold/20 p-6 rounded-2xl space-y-4">
                  <div className="flex gap-4">
                    <Button className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl" onClick={() => updateStatus('confirmed')}>تأكيد الدفع</Button>
                    <Button variant="destructive" className="flex-1 h-14 font-bold rounded-xl" onClick={() => updateStatus('payment_failed', rejectReason)} disabled={!rejectReason.trim()}>رفض الدفع</Button>
                  </div>
                  <Textarea placeholder="اكتب ملاحظة للعميل في حالة الرفض..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="rounded-xl" />
                </div>
              )}

              <div className="border rounded-2xl overflow-hidden">
                 {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-4 border-b last:border-0 bg-white">
                      <p className="font-bold text-gold">{item.price * item.quantity} EGP</p>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{item.name}</p>
                          <p className="text-sm text-gray-500">الكمية: {item.quantity}</p>
                        </div>
                        <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                      </div>
                    </div>
                 ))}
                 <div className="p-5 bg-gray-50 flex justify-between items-center font-black text-xl">
                    <span className="text-gold">{selectedOrder.total} EGP</span>
                    <span>الإجمالي</span>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;