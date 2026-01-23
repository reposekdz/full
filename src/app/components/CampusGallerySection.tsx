import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn, ZoomOut, Download, Share2, Maximize2, Building2, Laptop, BookOpen, Trophy, RotateCw } from 'lucide-react';

const campusImages = [
  {
    id: 1,
    src: new URL('../assets/school view/1.jpg', import.meta.url).href,
    title: 'Main Administration Building',
    title_rw: 'Inyubako y\'Ubuyobozi',
    description: 'Modern administrative offices and reception area',
    description_rw: 'Ibiro by\'ubuyobozi n\'ahantu ho kwakira',
    icon: Building2,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 2,
    src: new URL('../assets/school view/2.jpg', import.meta.url).href,
    title: 'Classrooms & Learning Spaces',
    title_rw: 'Amaklasi n\'Ahantu ho Kwiga',
    description: 'Well-equipped classrooms with modern teaching facilities',
    description_rw: 'Amaklasi afite ibikoresho bigezweho byo kwigisha',
    icon: BookOpen,
    color: 'from-green-500 to-teal-600'
  },
  {
    id: 3,
    src: new URL('../assets/school view/3.jpg', import.meta.url).href,
    title: 'Computer Labs & Technology Center',
    title_rw: 'Laboratoire za Mudasobwa',
    description: 'State-of-the-art computer labs for practical training',
    description_rw: 'Laboratoire zigezweho zo kwiga ikoranabuhanga',
    icon: Laptop,
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 4,
    src: new URL('../assets/school view/4.jpg', import.meta.url).href,
    title: 'Sports & Recreation Facilities',
    title_rw: 'Ibikoresho bya Siporo',
    description: 'Modern sports fields and recreational areas',
    description_rw: 'Terrain ya siporo n\'ahantu ho kwidagadura',
    icon: Trophy,
    color: 'from-pink-500 to-rose-600'
  }
];

const CampusGallerySection: React.FC = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    setZoom(1);
    setRotation(0);
  };
  
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % campusImages.length);
      setZoom(1);
      setRotation(0);
    }
  };
  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + campusImages.length) % campusImages.length);
      setZoom(1);
      setRotation(0);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handleDownload = () => {
    if (selectedImage !== null) {
      const link = document.createElement('a');
      link.href = campusImages[selectedImage].src;
      link.download = `campus-${selectedImage + 1}.jpg`;
      link.click();
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div 
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center gap-3 mb-6"
            >
              <div className="bg-gradient-to-r from-yellow-500 to-green-500 p-4 rounded-2xl shadow-xl">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-yellow-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                {language === 'rw' ? 'Itegereze Ikigo cya Garden TVET School' : 'View Garden TVET School Campus'}
              </h2>
            </motion.div>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              {language === 'rw' 
                ? 'Amafoto y\'ikigo cyacu, amaklasi, laboratoire n\'ibikoresho byacu bigezweho' 
                : 'Photos of our campus, classrooms, laboratories and modern facilities'}
            </p>
          </motion.div>

          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {campusImages.map((image, index) => {
              const Icon = image.icon;
              return (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, type: 'spring' }}
                  whileHover={{ scale: 1.03, y: -10 }}
                  className="group relative"
                >
                  <div 
                    className="relative h-80 overflow-hidden rounded-3xl shadow-2xl cursor-pointer border-4 border-yellow-200 hover:border-green-400 transition-all duration-500"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.src}
                      alt={language === 'rw' ? image.title_rw : image.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${image.color} px-4 py-2 rounded-full mb-4 shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                          <span className="text-white text-sm font-bold">
                            {language === 'rw' ? 'Reba Byinshi' : 'View Details'}
                          </span>
                        </div>
                        <h3 className="text-white font-black text-2xl mb-3">
                          {language === 'rw' ? image.title_rw : image.title}
                        </h3>
                        <p className="text-white/90 text-base">
                          {language === 'rw' ? image.description_rw : image.description}
                        </p>
                      </div>
                      
                      <div className="absolute top-6 right-6 transform scale-0 group-hover:scale-100 transition-transform duration-500">
                        <div className="bg-white/20 backdrop-blur-md rounded-full p-4 shadow-xl">
                          <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`absolute -top-4 -right-4 bg-gradient-to-r ${image.color} text-white rounded-full p-4 shadow-2xl`}
                    >
                      <Icon className="w-7 h-7" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Advanced Lightbox Modal */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/98 flex flex-col"
            onClick={closeLightbox}
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-r ${campusImages[selectedImage].color} p-3 rounded-xl`}>
                  {React.createElement(campusImages[selectedImage].icon, { className: "w-6 h-6 text-white" })}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">
                    {language === 'rw' ? campusImages[selectedImage].title_rw : campusImages[selectedImage].title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {selectedImage + 1} / {campusImages.length}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-3 transition-colors"
                >
                  <ZoomOut className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-3 transition-colors"
                >
                  <ZoomIn className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleRotate(); }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-3 transition-colors"
                >
                  <RotateCw className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl p-3 transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={closeLightbox}
                  className="bg-red-500 hover:bg-red-600 rounded-xl p-3 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
              <motion.button
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.2, x: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-5 transition-colors shadow-2xl"
              >
                <ChevronLeft className="w-10 h-10 text-white" />
              </motion.button>

              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: zoom,
                  rotate: rotation
                }}
                transition={{ type: 'spring', stiffness: 200 }}
                src={campusImages[selectedImage].src}
                alt={language === 'rw' ? campusImages[selectedImage].title_rw : campusImages[selectedImage].title}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                style={{ transformOrigin: 'center' }}
              />

              <motion.button
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                whileHover={{ scale: 1.2, x: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-8 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-5 transition-colors shadow-2xl"
              >
                <ChevronRight className="w-10 h-10 text-white" />
              </motion.button>
            </div>

            {/* Bottom Info Bar */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-t from-black/80 to-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-4xl mx-auto">
                <p className="text-white/90 text-lg text-center mb-6">
                  {language === 'rw' ? campusImages[selectedImage].description_rw : campusImages[selectedImage].description}
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  {campusImages.map((_, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); openLightbox(idx); }}
                      className={`h-3 rounded-full transition-all ${
                        idx === selectedImage 
                          ? 'bg-white w-12' 
                          : 'bg-white/40 w-3 hover:bg-white/60'
                      }`}
                    />
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
