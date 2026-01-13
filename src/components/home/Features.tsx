import { Truck, Shield, Sparkles, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const features = [
  {
    icon: Truck,
    titleEn: 'Free Delivery',
    titleAr: 'توصيل مجاني',
    descEn: 'On orders over 50,000 EGP',
    descAr: 'للطلبات فوق 50,000 ج.م',
  },
  {
    icon: Shield,
    titleEn: '5-Year Warranty',
    titleAr: 'ضمان 5 سنوات',
    descEn: 'Quality guaranteed',
    descAr: 'جودة مضمونة',
  },
  {
    icon: Sparkles,
    titleEn: 'Premium Quality',
    titleAr: 'جودة فاخرة',
    descEn: 'Handcrafted excellence',
    descAr: 'حرفية يدوية متميزة',
  },
  {
    icon: HeadphonesIcon,
    titleEn: '24/7 Support',
    titleAr: 'دعم على مدار الساعة',
    descEn: 'Always here to help',
    descAr: 'دائماً هنا لمساعدتك',
  },
];

const Features = () => {
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-charcoal">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center mb-4 group-hover:border-gold group-hover:bg-gold/10 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="text-primary-foreground font-semibold mb-1">
                {language === 'ar' ? feature.titleAr : feature.titleEn}
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                {language === 'ar' ? feature.descAr : feature.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
