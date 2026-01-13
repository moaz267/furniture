import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CartSidebar = () => {
  const { t, language, isRTL } = useLanguage();
  const { items, removeFromCart, updateQuantity, getTotal, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-EG').format(price);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl animate-slide-in",
          isRTL ? "left-0" : "right-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-serif font-semibold">{t('yourCart')}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              className="hover:bg-muted"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground mb-6">{t('emptyCart')}</p>
                <Button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/shop');
                  }}
                  className="gradient-gold text-charcoal hover:opacity-90"
                >
                  {t('continueShopping')}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-border last:border-0">
                    {/* Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={language === 'ar' ? item.nameAr : item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {language === 'ar' ? item.nameAr : item.name}
                      </h3>
                      <p className="text-gold font-semibold text-sm mb-3">
                        {formatPrice(item.price)} {t('egp')}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between mb-6">
                <span className="text-muted-foreground">{t('subtotal')}</span>
                <span className="text-xl font-serif font-semibold">
                  {formatPrice(getTotal())} {t('egp')}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full gradient-gold text-charcoal hover:opacity-90 h-12 text-base font-semibold"
              >
                {t('checkout')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
