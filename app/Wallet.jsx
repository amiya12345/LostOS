'use client'
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CyberpunkWallet = () => {
  const [showFinalText, setShowFinalText] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [images, setImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate random positions for images
  const generateRandomPosition = () => ({
    x: Math.random() * (window.innerWidth - 100),
    y: Math.random() * (window.innerHeight - 100),
  });

  // Add new image at random intervals - keeping exactly as original
  useEffect(() => {
    const imageUrls = Array(20).fill().map((_, index) => `/images/${index + 1}.png`);
    let timeoutIds = [];
  
    for (let i = 0; i < 100; i++) {
      const timeout = setTimeout(() => {
        const randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
        setImages(prev => [...prev, {
          id: i,
          position: generateRandomPosition(),
          url: randomImageUrl
        }]);
      }, Math.random() * 25000); // Spread over 25 seconds
      timeoutIds.push(timeout);
    }

    // Show final text after 30 seconds
    const finalTextTimeout = setTimeout(() => {
      setShowFinalText(true);
    }, 30000);

    // Show wallet after 32 seconds
    const walletTimeout = setTimeout(() => {
      setShowWallet(true);
    }, 32000);

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
      clearTimeout(finalTextTimeout);
      clearTimeout(walletTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix-style background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,20,0,0.8),rgba(0,10,0,0.9))] pointer-events-none" />

      {/* Random appearing images - kept exactly the same */}
      <AnimatePresence>
        {images.map(image => (
          <motion.div
            key={image.id}
            initial={{ scale: 0, x: image.position.x, y: image.position.y }}
            animate={{ 
              scale: 1,
              filter: [
                'brightness(1) contrast(100%)',
                'brightness(1.2) contrast(150%)',
                'brightness(1) contrast(100%)'
              ]
            }}
            transition={{
              scale: { duration: 0.5 },
              filter: { duration: 0.2, repeat: Infinity }
            }}
            className="absolute"
          >
            <img
              src={image.url}
              alt="matrix"
              className="w-[100%] h-[100%] object-cover opacity-80 mix-blend-screen"
              style={isMobile ? { maxWidth: '60px', maxHeight: '60px' } : {}}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* "It's not over" text */}
      <AnimatePresence>
        {showFinalText && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0.5, 1],
              filter: [
                'blur(10px)',
                'blur(0px)',
                'blur(5px)',
                'blur(0px)'
              ]
            }}
            transition={{ duration: 2 }}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${isMobile ? 'text-xl' : 'text-3xl'} font-omiofont1`}
          >
            IT&apos;S NOT OVER
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet address with terminal effect */}
      <AnimatePresence>
        {showWallet && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              textShadow: [
                '0 0 5px #00ff00',
                '0 0 15px #00ff00',
                '0 0 5px #00ff00'
              ]
            }}
            transition={{ 
              duration: 1,
              textShadow: {
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }
            }}
            className={`absolute ${isMobile ? 'bottom-32' : 'bottom-1/4'} left-1/2 transform -translate-x-1/2 text-center ${isMobile ? 'w-[90%]' : ''}`}
          >
            <div className={`bg-black/80 p-6 border border-green-500/30 backdrop-blur-sm ${isMobile ? 'rounded-lg' : ''}`}>
              <motion.div
                animate={{
                  opacity: [1, 0.8, 1],
                  scale: [1, 1.01, 1]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className={`${isMobile ? 'text-xs' : 'text-sm'} mb-2 font-omiofont1`}
              >
                &gt; INITIALIZING CA
              </motion.div>
              <motion.div 
                className={`font-bold ${isMobile ? 'text-sm' : 'text-lg'} mt-2 break-all font-omiofont1`}
                animate={{
                  textShadow: [
                    '0 0 5px #00ff00',
                    '0 0 15px #00ff00',
                    '0 0 5px #00ff00'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
             
              </motion.div>
              
              {/* Mobile-only Android-style indicator */}
              {isMobile && (
                <div className="mt-4 w-12 h-1 bg-green-500/40 mx-auto rounded-full" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyberpunkWallet;