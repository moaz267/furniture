import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const categories = [
  {
    id: 'bedrooms',
    nameEn: 'Bedrooms',
    nameAr: 'غرف النوم',
    descEn: 'Rest in luxury',
    descAr: 'استرح في رفاهية',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
  },
  {
    id: 'living',
    nameEn: 'Living Rooms',
    nameAr: 'غرف المعيشة',
    descEn: 'Where life happens',
    descAr: 'حيث تحدث الحياة',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=800&q=80',
  },
  {
    id: 'dining',
    nameEn: 'Dining',
    nameAr: 'غرف الطعام',
    descEn: 'Gather in style',
    descAr: 'اجتمع بأناقة',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&q=80',
  },
];

const Categories = () => {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 gold-underline inline-block">
            {t('shopByCategory')}
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              onClick={() => navigate(`/shop?category=${category.id}`)}
              className={cn(
                "group relative overflow-hidden rounded-2xl cursor-pointer hover-lift",
                "aspect-[4/5] md:aspect-[3/4]"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.image})` }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                  <p className="text-gold text-sm uppercase capitaling-widest mb-2">
                    {language === 'ar' ? category.descAr : category.descEn}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold text-primary-foreground mb-4">
                    {language === 'ar' ? category.nameAr : category.nameEn}
                  </h3>
                  <div className="flex items-center gap-2 text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">{t('shopNow')}</span>
                    <Arrow className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Gold accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 gradient-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
