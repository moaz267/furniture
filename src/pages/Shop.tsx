import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/WhatsAppButton';
import ProductCard from '@/components/products/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; 
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  images: string[] | null;
  category_id: string | null;
  slug: string;
  in_stock: boolean;
  categories?: { id: string; name: string; name_ar: string; slug: string } | null;
  created_at?: string; // أضفت هذا الحقل للتأكد من الترتيب الزمني
}

interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
}

const PRODUCTS_PER_PAGE = 9;

const Shop = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const categoryParam = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 1000000 
  });

  useEffect(() => {
    const fetchData = async () => {
      // تعديل هنا: أضفنا .order('created_at', { ascending: false }) لجلب الأحدث أولاً
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, categories(id, name, name_ar, slug)')
          .order('created_at', { ascending: false }), // الترتيب من الأحدث للأقدم
        supabase.from('categories').select('*'),
      ]);

      if (productsRes.data) {
        setProducts(productsRes.data);
        const prices = productsRes.data.map(p => p.price);
        if (prices.length > 0) {
          setPriceRange(prev => ({ ...prev, max: Math.max(...prices) }));
        }
      }
      if (categoriesRes.data) setCategories(categoriesRes.data);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'all' || product.categories?.slug === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && (priceRange.max === 0 ? true : product.price <= priceRange.max);
      return matchesCategory && matchesPrice;
    });
  }, [products, selectedCategory, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="pt-20">
        <div className="bg-charcoal py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-4">
              {t('shop')}
            </h1>
            <p className="text-primary-foreground/60">
              {language === 'en' 
                ? 'Discover our exclusive collection of luxury furniture' 
                : 'اكتشف مجموعتنا الحصرية من الأثاث الفاخر'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className={cn("lg:w-72 flex-shrink-0", showFilters ? "block" : "hidden lg:block")}>
              <div className="bg-card rounded-xl p-6 shadow-card sticky top-24 border border-border/40">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif font-semibold text-lg">{t('filterByCategory')}</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)} className="lg:hidden">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-1 mb-8">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={cn(
                      "w-full text-start px-4 py-2.5 rounded-lg transition-all text-sm",
                      selectedCategory === 'all' ? "bg-gold text-charcoal font-bold shadow-sm" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {t('allCategories')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={cn(
                        "w-full text-start px-4 py-2.5 rounded-lg transition-all text-sm",
                        selectedCategory === category.slug ? "bg-gold text-charcoal font-bold shadow-sm" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      {language === 'ar' ? category.name_ar : category.name}
                    </button>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-serif font-semibold text-lg mb-4">
                    {language === 'ar' ? 'نطاق السعر' : 'Price Range'}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">{language === 'ar' ? 'من' : 'Min'}</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={priceRange.min || ''}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">{language === 'ar' ? 'إلى' : 'Max'}</label>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange.max || ''}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedProducts.map((product, index) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
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

              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className="cursor-pointer" />
                        </PaginationItem>
                      )}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink onClick={() => handlePageChange(page)} isActive={currentPage === page} className="cursor-pointer">
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className="cursor-pointer" />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
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

export default Shop;