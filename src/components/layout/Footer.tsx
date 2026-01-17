import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-charcoal text-primary-foreground/80 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 gradient-gold rounded-full flex items-center justify-center">
                <span className="text-charcoal font-bold text-2xl">T</span>
              </div>
              <div>
                <h3 className="text-gold font-serif text-xl font-semibold">{t('brandName')}</h3>
                <p className="text-gold/60 text-xs">{t('brandTagline')}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/60">
              {language === 'en'
                ? 'Crafting exceptional furniture pieces that transform houses into homes. Quality, elegance, and timeless design.'
                : 'نصنع قطع أثاث استثنائية تحول البيوت إلى منازل. الجودة والأناقة والتصميم الخالد.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-gold font-serif text-lg mb-6 gold-underline">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop', label: t('shop') },
                { href: '/about', label: t('about') },
                { href: '/contact', label: t('contact') },
                // إضافة زر دخول الإدارة هنا
                { 
                  href: '/admin-login', 
                  label: language === 'en' ? 'Admin Login' : 'دخول الإدارة',
                  isAdmin: true 
                },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`text-sm hover:text-gold transition-colors inline-flex items-center gap-2 ${
                      link.isAdmin ? 'text-gold/80' : ''
                    }`}
                  >
                    {link.isAdmin && <Shield className="w-3.5 h-3.5" />}
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-gold font-serif text-lg mb-6 gold-underline">{t('contact')}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-sm">{t('locationAddress')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <a href="tel:+201060044708" className="text-sm hover:text-gold transition-colors">
                  +201060044708
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <a href="mailto:info@capitalfurniture.com" className="text-sm hover:text-gold transition-colors">
                  info@capitalfurniture.com
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links & Map */}
          <div>
            <h4 className="text-gold font-serif text-lg mb-6 gold-underline">{t('followUs')}</h4>
            <div className="flex gap-4 mb-6">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center hover:bg-gold hover:text-charcoal transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            {/* Google Maps */}
            <div className="rounded-lg overflow-hidden h-32">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3412.3!2d31.8!3d31.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDI0JzAwLjAiTiAzMcKwNDgnMDAuMCJF!5e0!3m2!1sen!2seg!4v1630000000000!5m2!1sen!2seg"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Capital Furniture Location"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/40">
              © 2026 {t('brandName')}. {language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-xs text-primary-foreground/40 hover:text-gold transition-colors">
                {language === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
              </Link>
              <Link to="/terms" className="text-xs text-primary-foreground/40 hover:text-gold transition-colors">
                {language === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;