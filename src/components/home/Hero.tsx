import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
    titleEn: 'Luxury Living Starts Here',
    titleAr: 'الفخامة تبدأ من هنا',
    subtitleEn: 'Discover timeless elegance for your home',
    subtitleAr: 'اكتشف الأناقة الخالدة لمنزلك',
  },
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80',
    titleEn: 'Crafted for Perfection',
    titleAr: 'صُنعت للكمال',
    subtitleEn: 'Premium materials, exceptional craftsmanship',
    subtitleAr: 'مواد فاخرة وحرفية استثنائية',
  },
  {
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=80',
    titleEn: 'Transform Your Space',
    titleAr: 'حوّل مساحتك',
    subtitleEn: 'From vision to reality, we create dreams',
    subtitleAr: 'من الرؤية إلى الواقع، نصنع الأحلام',
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, t, isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[8000ms]"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
            }}
          />
          {/* Overlay - تم تعديل التدرج ليكون في المنتصف */}
          <div className="absolute inset-0 bg-charcoal/60 bg-gradient-to-b from-charcoal/40 via-charcoal/60 to-charcoal/40" />
        </div>
      ))}

      {/* Content - تم التعديل هنا ليصبح في المنتصف */}
      <div className="relative h-full container mx-auto px-4 flex items-center justify-center text-center">
        <div className="max-w-3xl flex flex-col items-center"> {/* إضافة items-center هنا */}
          {/* Gold accent line */}
          <div className="w-20 h-1 gradient-gold mb-8 animate-scale-in" />

          {/* Title - إضافة text-center لضمان التوسيط */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-primary-foreground mb-6 leading-tight animate-slide-up">
            {language === 'ar' ? slides[currentSlide].titleAr : slides[currentSlide].titleEn}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-10 animate-slide-up max-w-xl" style={{ animationDelay: '0.1s' }}>
            {language === 'ar' ? slides[currentSlide].subtitleAr : slides[currentSlide].subtitleEn}
          </p>

          {/* CTA Buttons - إضافة justify-center لتوسيط الأزرار */}
          <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button
              onClick={() => navigate('/shop')}
              size="lg"
              className="gradient-gold text-charcoal hover:opacity-90 px-10 h-14 text-lg font-bold shadow-gold"
            >
              {t('shopNow')}
            </Button>
            <Button
              onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
              variant="outline"
              size="lg"
              className="border-gold/50 text-gold hover:bg-gold/10 px-10 h-14 text-lg font-semibold"
            >
              {language === 'en' ? '▶ How to Order' : '▶ كيفية الطلب'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          className="w-12 h-12 rounded-full bg-charcoal/50 backdrop-blur-sm text-primary-foreground hover:bg-gold hover:text-charcoal pointer-events-auto transition-all"
        >
          {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          className="w-12 h-12 rounded-full bg-charcoal/50 backdrop-blur-sm text-primary-foreground hover:bg-gold hover:text-charcoal pointer-events-auto transition-all"
        >
          {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-gold"
                : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
            )}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 hidden md:block">
        <div className="flex flex-col items-center gap-2 text-primary-foreground/40">
          <span className="text-xs uppercase tracking-widest rotate-90 origin-center translate-y-8">
            {language === 'en' ? 'Scroll' : 'مرر'}
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-gold to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default Hero;