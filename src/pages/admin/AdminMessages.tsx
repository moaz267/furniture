import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Phone, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
    setIsLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', id);

    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, is_read: true } : msg
    ));
  };

  const deleteMessage = async (id: string) => {
    await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    setMessages(prev => prev.filter(msg => msg.id !== id));
    setIsDialogOpen(false);
  };

  const openMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold">Contact Messages</h1>
            <p className="text-muted-foreground mt-1">
              View and manage customer inquiries
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-gold text-charcoal">{unreadCount} unread</Badge>
              )}
            </p>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl">
              <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                onClick={() => openMessage(message)}
                className={cn(
                  "bg-card rounded-xl p-4 lg:p-6 shadow-card cursor-pointer hover:shadow-lg transition-all",
                  !message.is_read && "border-l-4 border-gold"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {message.is_read ? (
                      <MailOpen className="w-5 h-5 text-muted-foreground mt-1" />
                    ) : (
                      <Mail className="w-5 h-5 text-gold mt-1" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={cn("font-semibold", !message.is_read && "text-gold")}>
                          {message.name}
                        </p>
                        {!message.is_read && (
                          <Badge className="bg-gold/20 text-gold text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{message.email}</p>
                      <p className="font-medium mt-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(message.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="flex items-center gap-1 text-sm text-gold hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      {selectedMessage.phone}
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(selectedMessage.created_at), 'PPpp')}
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMessages;
