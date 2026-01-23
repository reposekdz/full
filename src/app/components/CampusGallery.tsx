import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { X, ChevronLeft, ChevronRight, ZoomIn, Camera } from 'lucide-react';

interface GalleryImage {
  id: number;
  title: string;
  title_rw: string;
  description?: string;
  description_rw?: string;
  image_url: string;
}

const CampusGallery: React.FC = () => {
  const { language } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gallery/images');
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-yellow-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-yellow-600" />
              <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                {language === 'rw' ? 'Itegereze Ikigo cya Garden TVET School' : 'View Garden TVET School Campus'}
              </h2>
            </div>
            <p className="text-gray-600 text-lg">
              {language === 'rw' 
                ? 'Amafoto y\'ikigo cyacu n\'ibikoresho byacu' 
                : 'Photos of our campus and facilities'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative aspect-square overflow-hidden rounded-xl shadow-lg cursor-pointer border-2 border-yellow-200 hover:border-green-400 transition-all"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={`http://localhost:5000${image.image_url}`}
                  alt={language === 'rw' ? image.title_rw : image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">
                      {language === 'rw' ? image.title_rw : image.title}
                    </h3>
                    {(language === 'rw' ? image.description_rw : image.description) && (
                      <p className="text-white/90 text-sm mt-1">
                        {language === 'rw' ? image.description_rw : image.description}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={`http://localhost:5000${images[selectedImage].image_url}`}
                alt={language === 'rw' ? images[selectedImage].title_rw : images[selectedImage].title}
                className="w-full h-full object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                <h3 className="text-white text-2xl font-bold">
                  {language === 'rw' ? images[selectedImage].title_rw : images[selectedImage].title}
                </h3>
                {(language === 'rw' ? images[selectedImage].description_rw : images[selectedImage].description) && (
                  <p className="text-white/80 mt-2">
                    {language === 'rw' ? images[selectedImage].description_rw : images[selectedImage].description}
                  </p>
                )}
                <p className="text-white/60 text-sm mt-2">
                  {selectedImage + 1} / {images.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CampusGallery;
