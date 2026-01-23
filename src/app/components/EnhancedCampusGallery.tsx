import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn, ZoomOut, Download, RotateCw, Maximize2, Image as ImageIcon } from 'lucide-react';
import schoolImg1 from '@/assets/school view/1.jpg';
import schoolImg2 from '@/assets/school view/2.jpg';
import schoolImg3 from '@/assets/school view/3.jpg';
import schoolImg4 from '@/assets/school view/4.jpg';

const defaultImages = [
  { id: 1, src: schoolImg1, title: 'Main Building', title_rw: 'Inyubako y\'Ubuyobozi', description: 'Modern administrative offices', description_rw: 'Ibiro by\'ubuyobozi', category: 'campus' },
  { id: 2, src: schoolImg2, title: 'Classrooms', title_rw: 'Amaklasi', description: 'Well-equipped classrooms', description_rw: 'Amaklasi afite ibikoresho', category: 'classroom' },
  { id: 3, src: schoolImg3, title: 'Computer Labs', title_rw: 'Laboratoire', description: 'State-of-the-art labs', description_rw: 'Laboratoire zigezweho', category: 'lab' },
  { id: 4, src: schoolImg4, title: 'Sports Facilities', title_rw: 'Ibikoresho bya Siporo', description: 'Modern sports fields', description_rw: 'Terrain ya siporo', category: 'sports' }
];

const CampusGallerySection: React.FC = () => {
  const { language } = useLanguage();
  const [images, setImages] = useState(defaultImages);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/gallery/images')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.images.length > 0) {
          setImages(data.images.map((img: any) => ({
            ...img,
            src: img.image_url.startsWith('/uploads') ? `http://localhost:5000${img.image_url}` : img.image_url
          })));
        }
      })
      .catch(() => console.log('Using default images'));
  }, []);

  const displayImages = images.slice(0, 4);
  const remainingCount = Math.max(0, images.length - 4);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setZoom(1);
    setRotation(0);
    setIsFullscreen(false);
  };
  
  const closeLightbox = () => setSelectedImage(null);
  
  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
      setZoom(1);
      setRotation(0);
    }
  };
  
  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  
  const handleDownload = async () => {
    if (selectedImage !== null) {
      try {
        const response = await fetch(images[selectedImage].src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `garden-tvet-${images[selectedImage].category}-${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-yellow-50 via-white to-green-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200 }} className="inline-flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-green-500 p-4 rounded-2xl shadow-xl">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                {language === 'rw' ? 'Itegereze Ikigo cya Garden TVET School' : 'View Garden TVET School Campus'}
              </h2>
            </motion.div>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              {language === 'rw' ? 'Amafoto y\'ikigo cyacu, amaklasi, laboratoire n\'ibikoresho byacu bigezweho' : 'Photos of our campus, classrooms, laboratories and modern facilities'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {displayImages.map((image, index) => {
              const isLastImage = index === 3 && remainingCount > 0;
              return (
                <motion.div key={image.id} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.15, type: 'spring' }} whileHover={{ scale: 1.03, y: -10 }} className="group relative">
                  <div className="relative h-80 overflow-hidden rounded-3xl shadow-2xl cursor-pointer border-4 border-yellow-200 hover:border-green-400 transition-all duration-500" onClick={() => openLightbox(index)}>
                    <img src={image.src} alt={language === 'rw' ? image.title_rw : image.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    
                    {isLastImage && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <div className="bg-gradient-to-r from-yellow-500 to-green-500 rounded-full w-32 h-32 flex items-center justify-center mb-4 shadow-2xl">
                            <span className="text-white text-5xl font-black">+{remainingCount}</span>
                          </div>
                          <p className="text-white text-xl font-bold">{language === 'rw' ? 'Amafoto Yandi' : 'More Photos'}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-green-500 px-3 py-1.5 rounded-full mb-3 shadow-lg">
                          <ImageIcon className="w-4 h-4 text-white" />
                          <span className="text-white text-xs font-bold uppercase">{image.category}</span>
                        </div>
                        <h3 className="text-white font-black text-xl mb-2">{language === 'rw' ? image.title_rw : image.title}</h3>
                        <p className="text-white/90 text-sm">{language === 'rw' ? image.description_rw : image.description}</p>
                      </div>
                      <div className="absolute top-4 right-4 transform scale-0 group-hover:scale-100 transition-transform duration-500">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-3 shadow-xl">
                          <ZoomIn className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/98 flex flex-col" onClick={closeLightbox}>
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/90 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-yellow-500 to-green-500 p-2.5 rounded-xl">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{language === 'rw' ? images[selectedImage].title_rw : images[selectedImage].title}</h3>
                  <p className="text-white/70 text-xs">{selectedImage + 1} / {images.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-2.5 transition-colors">
                  <ZoomOut className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-2.5 transition-colors">
                  <ZoomIn className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleRotate(); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-2.5 transition-colors">
                  <RotateCw className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-2.5 transition-colors">
                  <Maximize2 className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); handleDownload(); }} className="bg-green-500 hover:bg-green-600 rounded-lg p-2.5 transition-colors">
                  <Download className="w-4 h-4 text-white" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={closeLightbox} className="bg-red-500 hover:bg-red-600 rounded-lg p-2.5 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <motion.button initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} whileHover={{ scale: 1.2, x: -10 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-4 transition-colors shadow-2xl z-10">
                <ChevronLeft className="w-8 h-8 text-white" />
              </motion.button>

              <motion.img key={selectedImage} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: zoom, rotate: rotation }} transition={{ type: 'spring', stiffness: 200 }} src={images[selectedImage].src} alt={language === 'rw' ? images[selectedImage].title_rw : images[selectedImage].title} className={`max-w-full max-h-full object-contain rounded-xl shadow-2xl ${isFullscreen ? 'w-screen h-screen object-cover' : ''}`} style={{ transformOrigin: 'center' }} />

              <motion.button initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} whileHover={{ scale: 1.2, x: 10 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-4 transition-colors shadow-2xl z-10">
                <ChevronRight className="w-8 h-8 text-white" />
              </motion.button>
            </div>

            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="p-4 bg-gradient-to-t from-black/90 to-transparent" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-4xl mx-auto">
                <p className="text-white/90 text-base text-center mb-4">{language === 'rw' ? images[selectedImage].description_rw : images[selectedImage].description}</p>
                <div className="flex items-center justify-center gap-2">
                  {images.map((_, idx) => (
                    <motion.button key={idx} whileHover={{ scale: 1.5 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); openLightbox(idx); }} className={`h-2 rounded-full transition-all ${idx === selectedImage ? 'bg-white w-10' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CampusGallerySection;
