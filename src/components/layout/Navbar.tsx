import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { getItemCount, setIsCartOpen } = useCart();
  const location = useLocation();

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/shop', label: t('shop') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal/95 backdrop-blur-md border-b border-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section - تكبير حجم اسم البراند */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center overflow-hidden">
              <img src="/src/assets/profile.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-gold font-serif text-2xl font-bold tracking-tight leading-none">
                {t('brandName')}
              </span>
              <span className="text-gold/60 text-xs uppercase tracking-[0.1em] mt-1">
                {language === 'en' ? 'Luxury Furniture' : 'أثاث فاخر'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - تكبير حجم لينكات التنقل */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "text-lg font-semibold transition-colors hover:text-gold relative py-2",
                  location.pathname === link.href
                    ? "text-gold"
                    : "text-primary-foreground/90"
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </Link>
            ))}
          </div>

          {/* Actions Section - تكبير أيقونات ونصوص الأزرار */}
          <div className="flex items-center gap-5">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="default" // تم التغيير من sm لـ default
              onClick={toggleLanguage}
              className="text-primary-foreground/90 hover:text-gold hover:bg-gold/10 gap-2 px-3"
            >
              <Globe className="w-5 h-5" />
              <span className="text-base font-bold">{language === 'en' ? 'عربي' : 'EN'}</span>
            </Button>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsCartOpen(true)}
              className="relative text-primary-foreground/90 hover:text-gold hover:bg-gold/10 p-2"
            >
              <ShoppingBag className="w-6 h-6" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gold text-charcoal text-xs rounded-full flex items-center justify-center font-bold">
                  {getItemCount()}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-primary-foreground/90 hover:text-gold hover:bg-gold/10"
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - تكبير الروابط في الموبايل */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gold/20 animate-fade-in bg-charcoal">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "px-6 py-4 text-xl font-bold transition-colors rounded-xl",
                    location.pathname === link.href
                      ? "text-gold bg-gold/10"
                      : "text-primary-foreground/90 hover:text-gold hover:bg-gold/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;