import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Contact = () => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const contactInfo = [
    {
      icon: MapPin,
      titleEn: 'Address',
      titleAr: 'العنوان',
      value: language === 'en'
        ? 'Damietta, Port Said Rd (Next to El Gammal Pastry)'
        : 'دمياط، طريق بورسعيد (بجوار حلواني الجمال)',
    },
    {
      icon: Phone,
      titleEn: 'Phone',
      titleAr: 'الهاتف',
      value: '+201060044708',
      href: 'tel:+201555731200',
    },
    {
      icon: Mail,
      titleEn: 'Email',
      titleAr: 'البريد الإلكتروني',
      value: 'info@capitalfurniture.com',
      href: 'mailto:info@capitalfurniture.com',
    },
    {
      icon: Clock,
      titleEn: 'Working Hours',
      titleAr: 'ساعات العمل',
      value: language === 'en' ? 'Daily: 10 AM - 10 PM' : 'يومياً: 10 صباحاً - 10 مساءً',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error(language === 'en' ? 'Please fill in all required fields' : 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        subject: formData.subject,
        message: formData.message,
      });

      if (error) throw error;

      toast.success(
        language === 'en' 
          ? 'Message sent successfully! We will get back to you soon.' 
          : 'تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.'
      );

      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting message:', error);
      toast.error(
        language === 'en' 
          ? 'Failed to send message. Please try again.' 
          : 'فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="pt-20">
        {/* Header */}
        <div className="bg-charcoal py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-4">
              {t('contact')}
            </h1>
            <p className="text-primary-foreground/60">
              {language === 'en'
                ? "We'd love to hear from you"
                : 'يسعدنا التواصل معك'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-serif font-semibold mb-8 gold-underline inline-block">
                {language === 'en' ? 'Get in Touch' : 'تواصل معنا'}
              </h2>

              <div className="space-y-6 mb-12">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">
                        {language === 'ar' ? info.titleAr : info.titleEn}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-muted-foreground hover:text-gold transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="aspect-video rounded-xl overflow-hidden bg-card shadow-card">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3422.7!2d31.8!3d31.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDI0JzAwLjAiTiAzMcKwNDgnMDAuMCJF!5e0!3m2!1sen!2seg!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-card rounded-xl p-8 shadow-card">
                <h2 className="text-2xl font-serif font-semibold mb-6">
                  {language === 'en' ? 'Send us a Message' : 'أرسل لنا رسالة'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">{language === 'en' ? 'Name' : 'الاسم'} *</Label>
                      <Input 
                        id="name" 
                        className="mt-1" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('email')} *</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        className="mt-1" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('phone')}</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      className="mt-1" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">{language === 'en' ? 'Subject' : 'الموضوع'} *</Label>
                    <Input 
                      id="subject" 
                      className="mt-1" 
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">{language === 'en' ? 'Message' : 'الرسالة'} *</Label>
                    <Textarea 
                      id="message" 
                      rows={5} 
                      className="mt-1" 
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 gradient-gold text-charcoal text-base font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'en' ? 'Sending...' : 'جاري الإرسال...'}
                      </>
                    ) : (
                      language === 'en' ? 'Send Message' : 'إرسال الرسالة'
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar />
      <WhatsAppButton />
    </div>
  );
};

export default Contact;
