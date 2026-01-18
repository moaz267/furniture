import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const NewArrivals = () => {
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      // هنا بنطلب من Supabase أحدث 4 منتجات مرتبة تنازلياً حسب وقت الإضافة
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name, name_ar, slug)')
        .order('created_at', { ascending: false })
        .limit(4);

      if (!error && data) {
        setNewProducts(data);
      }
      setIsLoading(false);
    };

    fetchNewArrivals();
  }, []);

  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  if (isLoading) return null; // أو ممكن تحط Skeleton Loader هنا

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gold text-sm uppercase tracking-widest mb-2">
              {isRTL ? 'حصري لعام 2026' : 'Exclusive 2026'}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold gold-underline inline-block">
              {t('newArrivals')}
            </h2>
          </div>
          <Button
            onClick={() => navigate('/shop')}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-charcoal gap-2"
          >
            {t('viewCollection')}
            <Arrow className="w-4 h-4" />
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard 
                product={{
                  id: product.id,
                  name: product.name,
                  nameAr: product.name_ar,
                  price: product.price,
                  image: product.images?.[0] || '',
                  category: product.categories?.slug || '',
                  categoryAr: product.categories?.name_ar || '',
                  inStock: product.in_stock,
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;