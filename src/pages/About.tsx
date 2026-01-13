import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useLanguage } from '@/contexts/LanguageContext';

const About = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="pt-20">
        {/* Hero */}
        <div className="relative h-[50vh] min-h-[400px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-charcoal/70" />
          <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-4">
                {t('about')}
              </h1>
              <p className="text-xl text-primary-foreground/80">
                {t('brandTagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-20 h-1 gradient-gold mx-auto mb-8" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
                {language === 'en' ? 'Our Story' : 'قصتنا'}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {language === 'en'
                  ? 'For over a decade, capital Furniture has been at the forefront of luxury furniture design in Egypt. Born from a passion for exceptional craftsmanship and timeless elegance, we have grown from a small workshop in Damietta to one of the most trusted names in premium furniture.'
                  : 'لأكثر من عقد من الزمان، كانت تراك للأثاث في طليعة تصميم الأثاث الفاخر في مصر. ولدت من شغف بالحرفية الاستثنائية والأناقة الخالدة، نمونا من ورشة صغيرة في دمياط إلى واحدة من أكثر الأسماء الموثوقة في الأثاث الفاخر.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  number: '15+',
                  labelEn: 'Years of Excellence',
                  labelAr: 'سنوات من التميز',
                },
                {
                  number: '5000+',
                  labelEn: 'Happy Customers',
                  labelAr: 'عميل سعيد',
                },
                {
                  number: '100%',
                  labelEn: 'Quality Guarantee',
                  labelAr: 'ضمان الجودة',
                },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-serif font-bold text-gold mb-2">{stat.number}</p>
                  <p className="text-muted-foreground">
                    {language === 'ar' ? stat.labelAr : stat.labelEn}
                  </p>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant">
              <h3 className="text-2xl font-serif font-semibold mb-6 text-center">
                {language === 'en' ? 'Visit Our Showroom' : 'زر معرضنا'}
              </h3>
              <div className="text-center">
                <p className="text-muted-foreground mb-4">{t('locationAddress')}</p>
                <p className="text-gold font-semibold">
                  {language === 'en' ? 'Open Daily: 10 AM - 10 PM' : 'مفتوح يومياً: 10 صباحاً - 10 مساءً'}
                </p>
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

export default About;
