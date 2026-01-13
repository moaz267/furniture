import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  // Navigation
  home: { en: 'Home', ar: 'الرئيسية' },
  shop: { en: 'Shop', ar: 'المتجر' },
  categories: { en: 'Categories', ar: 'الفئات' },
  about: { en: 'About', ar: 'من نحن' },
  contact: { en: 'Contact', ar: 'تواصل معنا' },
  cart: { en: 'Cart', ar: 'السلة' },
  
  // Hero
  heroTitle: { en: 'Luxury Living Starts Here', ar: 'الفخامة تبدأ من هنا' },
  heroSubtitle: { en: 'Discover timeless elegance for your home', ar: 'اكتشف الأناقة الخالدة لمنزلك' },
  shopNow: { en: 'Shop Now', ar: 'تسوق الآن' },
  viewCollection: { en: 'View Collection', ar: 'عرض المجموعة' },
  
  // Categories
  shopByCategory: { en: 'Shop by Category', ar: 'تسوق حسب الفئة' },
  bedrooms: { en: 'Bedrooms', ar: 'غرف النوم' },
  livingRooms: { en: 'Living Rooms', ar: 'غرف المعيشة' },
  dining: { en: 'Dining', ar: 'غرف الطعام' },
  
  // Products
  newArrivals: { en: 'New Arrivals 2026', ar: 'وصل حديثاً 2026' },
  featuredProducts: { en: 'Featured Products', ar: 'منتجات مميزة' },
  addToCart: { en: 'Add to Cart', ar: 'أضف للسلة' },
  viewDetails: { en: 'View Details', ar: 'عرض التفاصيل' },
  price: { en: 'Price', ar: 'السعر' },
  egp: { en: 'EGP', ar: 'ج.م' },
  
  // Filters
  filterByCategory: { en: 'Filter by Category', ar: 'تصفية حسب الفئة' },
  filterByPrice: { en: 'Filter by Price', ar: 'تصفية حسب السعر' },
  allCategories: { en: 'All Categories', ar: 'جميع الفئات' },
  priceRange: { en: 'Price Range', ar: 'نطاق السعر' },
  
  // Cart
  yourCart: { en: 'Your Cart', ar: 'سلة التسوق' },
  emptyCart: { en: 'Your cart is empty', ar: 'سلتك فارغة' },
  continueShopping: { en: 'Continue Shopping', ar: 'متابعة التسوق' },
  checkout: { en: 'Checkout', ar: 'إتمام الشراء' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  total: { en: 'Total', ar: 'المجموع' },
  remove: { en: 'Remove', ar: 'إزالة' },
  
  // Checkout
  shippingInfo: { en: 'Shipping Information', ar: 'معلومات الشحن' },
  paymentMethod: { en: 'Payment Method', ar: 'طريقة الدفع' },
  orderSummary: { en: 'Order Summary', ar: 'ملخص الطلب' },
  creditCard: { en: 'Credit Card', ar: 'بطاقة ائتمان' },
  vodafoneCash: { en: 'Vodafone Cash', ar: 'فودافون كاش' },
  instapay: { en: 'InstaPay', ar: 'انستاباي' },
  confirmOrder: { en: 'Confirm Order', ar: 'تأكيد الطلب' },
  orderSuccess: { en: 'Order Placed Successfully!', ar: 'تم تأكيد الطلب بنجاح!' },
  orderNumber: { en: 'Order Number', ar: 'رقم الطلب' },
  
  // Form fields
  firstName: { en: 'First Name', ar: 'الاسم الأول' },
  lastName: { en: 'Last Name', ar: 'اسم العائلة' },
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone', ar: 'الهاتف' },
  address: { en: 'Address', ar: 'العنوان' },
  city: { en: 'City', ar: 'المدينة' },
  
  // Footer
  followUs: { en: 'Follow Us', ar: 'تابعنا' },
  quickLinks: { en: 'Quick Links', ar: 'روابط سريعة' },
  customerService: { en: 'Customer Service', ar: 'خدمة العملاء' },
  location: { en: 'Location', ar: 'الموقع' },
  locationAddress: { en: 'Damietta, Port Said Rd (Next to El Gammal Pastry)', ar: 'دمياط، طريق بورسعيد (بجوار حلواني الجمال)' },
  whatsappHelp: { en: 'Need Help? Chat with us!', ar: 'تحتاج مساعدة؟ تواصل معنا!' },
  
  // Product details
  specifications: { en: 'Specifications', ar: 'المواصفات' },
  dimensions: { en: 'Dimensions', ar: 'الأبعاد' },
  material: { en: 'Material', ar: 'الخامة' },
  color: { en: 'Color', ar: 'اللون' },
  inStock: { en: 'In Stock', ar: 'متوفر' },
  outOfStock: { en: 'Out of Stock', ar: 'غير متوفر' },
  
  // Brand
  brandName: { en: 'capital Furniture', ar: 'تراك للأثاث' },
  brandTagline: { en: 'Crafting Luxury Since 2010', ar: 'نصنع الفخامة منذ 2010' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
