import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Wallet, ArrowLeft, ArrowRight, Copy, Check, Upload, X, Image as ImageIcon } from 'lucide-react';
import { z } from 'zod';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Validation schema for checkout form
const checkoutSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[\p{L}\s'-]+$/u, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[\p{L}\s'-]+$/u, 'Last name contains invalid characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)'),
  address: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must be less than 200 characters'),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be less than 50 characters'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type PaymentMethod = 'vodafone' | 'instapay';
type Step = 'shipping' | 'payment';

const Checkout = () => {
  const { t, language, isRTL } = useLanguage();
  const { items, getTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<Step>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = checkoutSchema.safeParse(formData);
    
    if (!result.success) {
      const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as keyof CheckoutFormData;
        if (!errors[field]) {
          errors[field] = error.message;
        }
      });
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setStep('payment');
  };

  const vodafoneNumber = '+201060044708';
  const instapayHandle = '@capital-furniture';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setScreenshotError(language === 'ar' ? 'يرجى اختيار صورة' : 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setScreenshotError(language === 'ar' ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    setScreenshotError(null);
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmOrder = async () => {
    if (!screenshotFile) {
      setScreenshotError(language === 'ar' ? 'يرجى إرفاق صورة التحويل' : 'Please upload payment screenshot');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        nameAr: item.nameAr,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      }));

      // Upload screenshot to storage
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(fileName, screenshotFile);

      if (uploadError) throw uploadError;

      // Create order
      const { error: orderError } = await supabase.from('orders').insert({
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        city: formData.city,
        items: orderItems,
        subtotal: getTotal(),
        shipping: 0,
        total: getTotal(),
        payment_method: paymentMethod,
        payment_status: 'pending',
        order_status: 'awaiting_payment',
        screenshot_url: fileName,
      });

      if (orderError) throw orderError;

      const orderNumber = `TRK-${Date.now().toString(36).toUpperCase()}`;
      clearCart();
      navigate('/thank-you', { state: { orderNumber } });
    } catch (error) {
      console.error('Error placing order:', error);
      setScreenshotError(language === 'ar' ? 'حدث خطأ. حاول مرة أخرى' : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xl text-muted-foreground mb-6">{t('emptyCart')}</p>
            <Button onClick={() => navigate('/shop')} className="gradient-gold text-charcoal">
              {t('continueShopping')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="pt-20">
        <div className="bg-charcoal py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground text-center">
              {t('checkout')}
            </h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Form Section */}
              <div className="lg:col-span-2">
                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "flex items-center gap-2",
                    step === 'shipping' ? "text-gold" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      step === 'shipping' ? "bg-gold text-charcoal" : "bg-muted"
                    )}>
                      1
                    </div>
                    <span className="hidden sm:inline">{t('shippingInfo')}</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className={cn(
                    "flex items-center gap-2",
                    step === 'payment' ? "text-gold" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      step === 'payment' ? "bg-gold text-charcoal" : "bg-muted"
                    )}>
                      2
                    </div>
                    <span className="hidden sm:inline">{t('paymentMethod')}</span>
                  </div>
                </div>

                {step === 'shipping' && (
                  <form onSubmit={handleSubmitShipping} className="bg-card rounded-xl p-8 shadow-card">
                    <h2 className="text-xl font-serif font-semibold mb-6">{t('shippingInfo')}</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">{t('firstName')}</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          maxLength={50}
                          className={cn("mt-1", formErrors.firstName && "border-destructive")}
                          aria-invalid={!!formErrors.firstName}
                        />
                        {formErrors.firstName && (
                          <p className="text-sm text-destructive mt-1">{formErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('lastName')}</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          maxLength={50}
                          className={cn("mt-1", formErrors.lastName && "border-destructive")}
                          aria-invalid={!!formErrors.lastName}
                        />
                        {formErrors.lastName && (
                          <p className="text-sm text-destructive mt-1">{formErrors.lastName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          maxLength={100}
                          className={cn("mt-1", formErrors.email && "border-destructive")}
                          aria-invalid={!!formErrors.email}
                        />
                        {formErrors.email && (
                          <p className="text-sm text-destructive mt-1">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">{t('phone')}</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength={15}
                          className={cn("mt-1", formErrors.phone && "border-destructive")}
                          aria-invalid={!!formErrors.phone}
                        />
                        {formErrors.phone && (
                          <p className="text-sm text-destructive mt-1">{formErrors.phone}</p>
                        )}
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="address">{t('address')}</Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          maxLength={200}
                          className={cn("mt-1", formErrors.address && "border-destructive")}
                          aria-invalid={!!formErrors.address}
                        />
                        {formErrors.address && (
                          <p className="text-sm text-destructive mt-1">{formErrors.address}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="city">{t('city')}</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          maxLength={50}
                          className={cn("mt-1", formErrors.city && "border-destructive")}
                          aria-invalid={!!formErrors.city}
                        />
                        {formErrors.city && (
                          <p className="text-sm text-destructive mt-1">{formErrors.city}</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full mt-8 h-12 gradient-gold text-charcoal text-base font-semibold">
                      {language === 'en' ? 'Continue to Payment' : 'المتابعة للدفع'}
                    </Button>
                  </form>
                )}

                {step === 'payment' && (
                  <div className="bg-card rounded-xl p-8 shadow-card">
                    <Button
                      variant="ghost"
                      onClick={() => setStep('shipping')}
                      className="mb-6 gap-2 text-muted-foreground"
                    >
                      <BackArrow className="w-4 h-4" />
                      {language === 'en' ? 'Back' : 'رجوع'}
                    </Button>

                    <h2 className="text-xl font-serif font-semibold mb-6">{t('paymentMethod')}</h2>

                    <div className="space-y-4 mb-6">
                      {/* Vodafone Cash Option */}
                      <button
                        onClick={() => setPaymentMethod('vodafone')}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                          paymentMethod === 'vodafone'
                            ? "border-gold bg-gold/5"
                            : "border-border hover:border-gold/50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          paymentMethod === 'vodafone' ? "bg-gold text-charcoal" : "bg-muted"
                        )}>
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="text-start">
                          <p className="font-semibold">{t('vodafoneCash')}</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'حول العربون عبر فودافون كاش' : 'Transfer deposit via Vodafone Cash'}
                          </p>
                        </div>
                      </button>

                      {/* InstaPay Option */}
                      <button
                        onClick={() => setPaymentMethod('instapay')}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                          paymentMethod === 'instapay'
                            ? "border-gold bg-gold/5"
                            : "border-border hover:border-gold/50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          paymentMethod === 'instapay' ? "bg-gold text-charcoal" : "bg-muted"
                        )}>
                          <Wallet className="w-6 h-6" />
                        </div>
                        <div className="text-start">
                          <p className="font-semibold">InstaPay</p>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'حول العربون عبر انستاباي' : 'Transfer deposit via InstaPay'}
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-muted rounded-xl p-6 mb-6">
                      {paymentMethod === 'vodafone' ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'رقم فودافون كاش' : 'Vodafone Cash Number'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-lg">{vodafoneNumber}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(vodafoneNumber)}
                                className="h-8 w-8"
                              >
                                {copiedNumber ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'حساب انستاباي' : 'InstaPay Handle'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-lg">{instapayHandle}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(instapayHandle)}
                                className="h-8 w-8"
                              >
                                {copiedNumber ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Screenshot Upload */}
                    <div className="mb-6">
                      <Label className="text-base font-semibold mb-3 block">
                        {language === 'ar' ? 'صورة التحويل *' : 'Payment Screenshot *'}
                      </Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        {language === 'ar'
                          ? 'أرفق صورة إيصال التحويل لتأكيد طلبك'
                          : 'Upload a screenshot of your transfer receipt to confirm your order'}
                      </p>
                      
                      {screenshotPreview ? (
                        <div className="relative border-2 border-gold rounded-xl p-4 bg-gold/5">
                          <img
                            src={screenshotPreview}
                            alt="Payment screenshot"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={removeScreenshot}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-gold hover:bg-gold/5",
                            screenshotError ? "border-destructive" : "border-border"
                          )}
                        >
                          <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                          <p className="font-medium">
                            {language === 'ar' ? 'اضغط لرفع صورة التحويل' : 'Click to upload screenshot'}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            PNG, JPG (max 5MB)
                          </p>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      
                      {screenshotError && (
                        <p className="text-sm text-destructive mt-2">{screenshotError}</p>
                      )}
                    </div>

                    <Button
                      onClick={handleConfirmOrder}
                      disabled={!screenshotFile || isSubmitting}
                      className="w-full h-12 gradient-gold text-charcoal text-base font-semibold disabled:opacity-50"
                    >
                      {isSubmitting
                        ? (language === 'ar' ? 'جاري التأكيد...' : 'Confirming...')
                        : t('confirmOrder')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-card rounded-xl p-6 shadow-card sticky top-24">
                  <h2 className="text-xl font-serif font-semibold mb-6">{t('orderSummary')}</h2>

                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={language === 'ar' ? item.nameAr : item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">
                            {language === 'ar' ? item.nameAr : item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">{t('subtotal')}</span>
                      <span>{formatPrice(getTotal())} {t('egp')}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Shipping' : 'الشحن'}
                      </span>
                      <span className="text-green-600">
                        {language === 'en' ? 'Free' : 'مجاني'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-border">
                      <span className="font-semibold">{t('total')}</span>
                      <span className="text-xl font-bold text-gold">
                        {formatPrice(getTotal())} {t('egp')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Checkout;
