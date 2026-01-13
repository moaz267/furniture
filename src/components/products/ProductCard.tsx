import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart, Product } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(price);
  };

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover-lift">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={product.image}
          alt={language === 'ar' ? product.nameAr : product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="gradient-gold text-charcoal hover:opacity-90 w-12 h-12 rounded-full"
          >
            <ShoppingBag className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate(`/product/${product.id}`)}
            className="bg-primary-foreground/90 hover:bg-primary-foreground border-0 text-charcoal w-12 h-12 rounded-full"
          >
            <Eye className="w-5 h-5" />
          </Button>
        </div>

        {/* Stock Badge */}
        {product.inStock === false && (
          <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-semibold px-3 py-1 rounded-full">
            {t('outOfStock')}
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-charcoal/80 backdrop-blur-sm text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
          {language === 'ar' ? product.categoryAr : product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          onClick={() => navigate(`/product/${product.id}`)}
          className="font-serif font-semibold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-gold transition-colors"
        >
          {language === 'ar' ? product.nameAr : product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-gold font-bold text-xl">
              {formatPrice(product.price)}
            </span>
            <span className="text-muted-foreground text-sm ms-1">{t('egp')}</span>
          </div>

          <Button
            size="sm"
            onClick={() => addToCart(product)}
            disabled={product.inStock === false}
            className={cn(
              "gradient-gold text-charcoal hover:opacity-90 text-xs",
              product.inStock === false && "opacity-50 cursor-not-allowed"
            )}
          >
            {t('addToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
