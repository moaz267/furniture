import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const ThankYou = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const orderNumber = location.state?.orderNumber || 'N/A';

  const whatsappNumber = '+201555731200';
  const whatsappMessage = language === 'ar'
    ? `مرحباً، لقد قمت بتحويل العربون لطلب رقم ${orderNumber}. أرفق لكم إيصال التحويل.`
    : `Hello, I have transferred the deposit for order ${orderNumber}. Attached is the transfer receipt.`;

  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center animate-scale-in">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              {language === 'ar' ? 'تم استلام طلبك!' : 'Order Received!'}
            </h1>
            
            <p className="text-muted-foreground mb-6">
              {language === 'ar'
                ? 'شكراً لطلبك. حالة طلبك الآن "في انتظار الدفع". يرجى إرسال إيصال التحويل عبر الواتساب لتأكيد الطلب.'
                : 'Thank you for your order. Your order status is now "Awaiting Payment". Please send the transfer receipt via WhatsApp to confirm your order.'}
            </p>

            <div className="bg-card rounded-xl p-6 mb-8 shadow-card">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
              </p>
              <p className="text-2xl font-mono font-bold text-gold">{orderNumber}</p>
            </div>

            <div className="space-y-4">
              <Button
                asChild
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white text-base font-semibold gap-2"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5" />
                  {language === 'ar' ? 'إرسال الإيصال عبر واتساب' : 'Send Receipt via WhatsApp'}
                </a>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full h-12"
              >
                {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
