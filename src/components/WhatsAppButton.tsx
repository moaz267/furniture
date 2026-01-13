import { MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const WhatsAppButton = () => {
  const { t, isRTL } = useLanguage();
  
  const whatsappNumber = '+201060044708';
  const message = encodeURIComponent('Hello, I would like to inquire about your furniture.');
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 group`}
    >
      {/* Tooltip */}
      <div className={`absolute bottom-full mb-3 ${isRTL ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
        <div className="bg-charcoal text-primary-foreground text-sm px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
          {t('whatsappHelp')}
          <div className={`absolute top-full ${isRTL ? 'left-6' : 'right-6'} w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-charcoal`} />
        </div>
      </div>
      
      {/* Button */}
      <div className="relative">
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-30" />
        
        {/* Main button */}
        <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
          <MessageCircle className="w-7 h-7 text-primary-foreground" fill="currentColor" />
        </div>
      </div>
    </a>
  );
};

export default WhatsAppButton;
