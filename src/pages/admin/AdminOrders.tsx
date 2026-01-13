import { useState, useEffect } from 'react';
import { Eye, Check, X, MessageCircle, Clock, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  screenshot_url: string | null;
  admin_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface TimelineEntry {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  awaiting_payment: 'bg-orange-100 text-orange-800 border-orange-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  payment_failed: 'bg-red-100 text-red-800 border-red-200',
};

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

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }

    // Type assertion for items since it comes as JSON
    const typedOrders = (data || []).map(order => ({
      ...order,
      items: order.items as unknown as OrderItem[]
    }));

    setOrders(typedOrders);
    setIsLoading(false);
  };

  const fetchTimeline = async (orderId: string) => {
    const { data } = await supabase
      .from('order_timeline')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    setTimeline(data || []);
  };

  const fetchScreenshot = async (screenshotPath: string) => {
    const { data } = await supabase.storage
      .from('payment-screenshots')
      .createSignedUrl(screenshotPath, 3600);
    
    setScreenshotUrl(data?.signedUrl || null);
  };

  const openOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
    setRejectReason('');
    await fetchTimeline(order.id);
    
    if (order.screenshot_url) {
      await fetchScreenshot(order.screenshot_url);
    } else {
      setScreenshotUrl(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string, notes?: string) => {
    setIsProcessing(true);
    
    try {
      // Get order details for email
      const order = orders.find(o => o.id === orderId);
      
      // Update order
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          order_status: status,
          payment_status: status === 'confirmed' || status === 'paid' ? 'paid' : 
                         status === 'payment_failed' ? 'failed' : 'pending',
          admin_notes: notes || null 
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Add timeline entry
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('order_timeline').insert({
        order_id: orderId,
        status,
        note: notes || null,
        created_by: user?.id
      });

      // Send email notification for approved/rejected orders
      if (order && (status === 'confirmed' || status === 'payment_failed')) {
        try {
          const emailStatus = status === 'confirmed' ? 'approved' : 'rejected';
          const { error: emailError } = await supabase.functions.invoke('send-order-notification', {
            body: {
              orderId: orderId,
              customerEmail: order.customer_email,
              customerName: order.customer_name,
              status: emailStatus,
              reason: notes || undefined,
            },
          });
          
          if (emailError) {
            console.error('Error sending notification email:', emailError);
          }
        } catch (emailErr) {
          console.error('Failed to send email notification:', emailErr);
        }
      }

      // Refresh data
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        await fetchTimeline(orderId);
        setSelectedOrder(prev => prev ? { ...prev, order_status: status, admin_notes: notes || null } : null);
      }
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setIsProcessing(false);
      setRejectReason('');
    }
  };

  const getWhatsAppUrl = (phone: string, orderNumber: string) => {
    const message = `Hello! Regarding your order ${orderNumber} at capital Furniture...`;
    return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EG').format(price);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold">Orders Management</h1>
          <p className="text-muted-foreground mt-1">View and manage all customer orders</p>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                {/* Order Header */}
                <div 
                  className="p-4 lg:p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start lg:items-center gap-4">
                      <div className="hidden lg:block">
                        {expandedOrders.has(order.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-mono text-sm text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="font-semibold">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={cn("border", statusColors[order.order_status])}>
                        {statusLabels[order.order_status] || order.order_status}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {order.payment_method}
                      </Badge>
                      <span className="font-semibold text-gold">
                        {formatPrice(order.total)} EGP
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openOrderDetails(order);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(getWhatsAppUrl(order.customer_phone, order.id.slice(0, 8).toUpperCase()), '_blank');
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedOrders.has(order.id) && (
                  <div className="border-t border-border p-4 lg:p-6 bg-muted/20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Items */}
                      <div>
                        <h4 className="font-semibold mb-3">Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="truncate">{item.name}</p>
                                <p className="text-muted-foreground">x{item.quantity}</p>
                              </div>
                              <span>{formatPrice(item.price * item.quantity)} EGP</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping */}
                      <div>
                        <h4 className="font-semibold mb-3">Shipping</h4>
                        <p className="text-sm">{order.shipping_address}</p>
                        <p className="text-sm text-muted-foreground">{order.city}</p>
                        {order.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Note: {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div>
                        <h4 className="font-semibold mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                          {order.order_status === 'awaiting_payment' && (
                            <>
                              <Button
                                size="sm"
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                disabled={isProcessing}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Approve Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="w-full"
                                onClick={() => openOrderDetails(order)}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject Payment
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Details
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Order placed {format(new Date(order.created_at), 'PPpp')}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                  <Badge className={cn("border", statusColors[selectedOrder.order_status])}>
                    {statusLabels[selectedOrder.order_status] || selectedOrder.order_status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Customer</h4>
                    <p>{selectedOrder.customer_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm">{selectedOrder.customer_phone}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-green-600"
                        onClick={() => window.open(getWhatsAppUrl(selectedOrder.customer_phone, selectedOrder.id.slice(0, 8).toUpperCase()), '_blank')}
                      >
                        <MessageCircle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Shipping</h4>
                    <p className="text-sm">{selectedOrder.shipping_address}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.city}</p>
                  </div>
                </div>

                {/* Payment Screenshot */}
                <div>
                  <h4 className="font-semibold mb-2">Payment Screenshot</h4>
                  {screenshotUrl ? (
                    <div className="border rounded-lg overflow-hidden bg-muted">
                      <img
                        src={screenshotUrl}
                        alt="Payment screenshot"
                        className="max-h-80 w-auto mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="border rounded-lg p-8 text-center bg-muted/50">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No screenshot uploaded</p>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-2">Order Items</h4>
                  <div className="border rounded-lg divide-y">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.price * item.quantity)} EGP</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right">
                    <p className="text-lg font-bold text-gold">
                      Total: {formatPrice(selectedOrder.total)} EGP
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold mb-2">Order Timeline</h4>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                      <span className="text-muted-foreground">
                        {format(new Date(selectedOrder.created_at), 'PPpp')}
                      </span>
                      <span>Order placed</span>
                    </div>
                    {timeline.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-gold mt-1.5" />
                        <span className="text-muted-foreground">
                          {format(new Date(entry.created_at), 'PPpp')}
                        </span>
                        <div>
                          <span>Status changed to {statusLabels[entry.status] || entry.status}</span>
                          {entry.note && (
                            <p className="text-muted-foreground mt-1">{entry.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {selectedOrder.order_status === 'awaiting_payment' && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Payment Actions</h4>
                    <div className="space-y-4">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                        disabled={isProcessing}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve Payment
                      </Button>

                      <div className="space-y-2">
                        <Textarea
                          placeholder="Reason for rejection (e.g., 'Wrong amount' or 'Screenshot not clear')"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => updateOrderStatus(selectedOrder.id, 'payment_failed', rejectReason)}
                          disabled={isProcessing || !rejectReason.trim()}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject Payment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {selectedOrder.admin_notes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-1">Admin Notes</h4>
                    <p className="text-sm text-red-700">{selectedOrder.admin_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
