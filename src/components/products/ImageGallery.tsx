import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery = ({ images, alt }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Ensure we have at least one image
  const displayImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'];
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square rounded-2xl overflow-hidden bg-card shadow-elegant">
        <img
          src={displayImages[selectedIndex]}
          alt={alt}
          className="w-full h-full object-cover transition-all duration-300"
          loading="lazy"
        />
      </div>
      
      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-gold ring-2 ring-gold/20"
                  : "border-transparent hover:border-gold/50"
              )}
            >
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
