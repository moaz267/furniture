import { useState } from 'react';
import { cn } from '@/lib/utils';
import { X, ZoomIn } from 'lucide-react'; // أيقونات اختيارية

interface ImageGalleryProps {
  images: string[] | null;
  alt: string;
}

const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // للتحكم في فتح الصورة كاملة

  const displayImages = (images && images.length > 0) 
    ? images 
    : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'];

  return (
    <div className="space-y-4">
      {/* الصورة الأساسية */}
      <div 
        className="group relative aspect-square rounded-2xl overflow-hidden bg-card shadow-elegant cursor-zoom-in"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={displayImages[selectedIndex]}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* طبقة تظهر عند الهوفر لتعطي إيحاء بأن الصورة قابلة للتكبير */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <ZoomIn className="text-white w-8 h-8" />
        </div>
      </div>

      {/* المصغرات */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index ? "border-gold" : "border-transparent"
              )}
            >
              <img src={image} alt={alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* النافذة المنبثقة (Lightbox) تظهر عند الكليك */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-5 right-5 text-white hover:text-gold transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={40} />
          </button>
          
          <img
            src={displayImages[selectedIndex]}
            alt={alt}
            className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;