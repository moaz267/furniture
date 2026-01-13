import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShoppingBag, Check, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/WhatsAppButton';
import ImageGallery from '@/components/products/ImageGallery';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  images: string[] | null;
  category_id: string | null;
  description: string | null;
  description_ar: string | null;
  dimensions: string | null;
  material: string | null;
  material_ar: string | null;
  color: string | null;
  color_ar: string | null;
  in_stock: boolean;
  slug: string;
  categories?: { name: string; name_ar: string } | null;
}

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, name_ar)')
        .or(`id.eq.${id},slug.eq.${id}`)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        setIsLoading(false);
        return;
      }

      setProduct(data);
      setIsLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <p className="text-xl mb-4">{language === 'en' ? 'Product not found' : 'المنتج غير موجود'}</p>
          <Button onClick={() => navigate('/shop')} className="gradient-gold text-charcoal">
            {t('continueShopping')}
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(price);
  };

  const handleAddToCart = () => {
    const cartProduct = {
      id: product.id,
      name: product.name,
      nameAr: product.name_ar,
      price: product.price,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      category: product.categories?.name || '',
      categoryAr: product.categories?.name_ar || '',
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const specs = [
    { label: t('dimensions'), value: product.dimensions },
    { label: t('material'), value: language === 'ar' ? product.material_ar : product.material },
    { label: t('color'), value: language === 'ar' ? product.color_ar : product.color },
  ].filter((spec) => spec.value);

  const productImages = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <BackArrow className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'رجوع'}
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <ImageGallery
              images={productImages}
              alt={language === 'ar' ? product.name_ar : product.name}
            />

            {/* Product Info */}
            <div className="lg:py-8">
              {/* Category */}
              <p className="text-gold text-sm uppercase capitaling-widest mb-2">
                {language === 'ar' ? product.categories?.name_ar : product.categories?.name}
              </p>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                {language === 'ar' ? product.name_ar : product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-bold text-gold">{formatPrice(product.price)}</span>
                <span className="text-muted-foreground">{t('egp')}</span>
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full",
                    product.in_stock ? "bg-green-500" : "bg-destructive"
                  )}
                />
                <span className={product.in_stock ? "text-green-600" : "text-destructive"}>
                  {product.in_stock ? t('inStock') : t('outOfStock')}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-8">
                {language === 'ar' ? product.description_ar : product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-medium">{language === 'en' ? 'Quantity' : 'الكمية'}:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                size="lg"
                className={cn(
                  "w-full h-14 text-base font-semibold gap-3 transition-all",
                  addedToCart
                    ? "bg-green-600 hover:bg-green-600"
                    : "gradient-gold text-charcoal hover:opacity-90"
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    {language === 'en' ? 'Added!' : 'تمت الإضافة!'}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {t('addToCart')}
                  </>
                )}
              </Button>

              {/* Specifications */}
              {specs.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="font-serif font-semibold text-xl mb-6 gold-underline inline-block">
                    {t('specifications')}
                  </h3>
                  <div className="space-y-4">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex justify-between py-3 border-b border-border/50">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
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

export default ProductDetails;
