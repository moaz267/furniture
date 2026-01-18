import { Truck, Shield, Sparkles, HeadphonesIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Features = () => {
  const { language } = useLanguage();

  return (
    // تم استخدام اللون الكريمي الفاتح جداً من الصورة
    <section className="py-12 md:py-20 bg-[#F9F8F6]"> 
      <div className="container mx-auto px-4">
        
        {/* الخريطة: عرضها الآن 5xl (أعرض من السابق) */}
        <div className="max-w-6xl mx-auto overflow-hidden shadow-sm border border-black/5 rounded-2xl">
          <div className="aspect-[21/8] bg-white"> 
            <iframe
              src="https://www.google.com/maps/embed?pb=..." // ضع هنا رابط الـ embed الفعلي
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;