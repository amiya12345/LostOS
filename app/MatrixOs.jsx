"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import dynamic from "next/dynamic";
import { motion, useDragControls } from "framer-motion";
import {
  FaWallet,
  FaChartLine,
  FaMusic,
  FaTerminal,
  FaTimes,
  FaGamepad
} from "react-icons/fa";
import { useMediaQuery } from "react-responsive";

// Dynamically import components with SSR disabled
const MusicComponent = dynamic(() => import("./Music"), { ssr: false });
const MatrixBackground = dynamic(() => import("./MatrixBG"), { ssr: false });
const WalletComponent = dynamic(() => import("./Wallet"), { ssr: false });
const TokensComponent = dynamic(() => import("./Tokens"), { ssr: false });
const TerminalComponent = dynamic(() => import("./Terminal"), { ssr: false });
const Mouse = dynamic(() => import("./Mouse"), { ssr: false });
const Game = dynamic(() => import("./Game"), { ssr: false });

// Sound effect function
const playClickSound = () => {
  const audio = new Audio("/171697-select.mp3"); // Add this sound file to your public directory
  audio.volume = 0.9; // Adjust volume as needed
  
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log("Audio playback failed:", error);
    });
  }
};

// Modal Component for Desktop and Mobile
function AppModal({ children, onClose, title, isLoading, isMobile }) {
  const dragControls = useDragControls();
  const modalRef = useRef(null);
  
  const [dimensions, setDimensions] = useState(
    isMobile 
      ? null
      : {
          width: window.innerWidth * 0.4,
          height: window.innerHeight * 0.7,
        }
  );

  const startResize = (direction) => (e) => {
    if (isMobile) return;
    
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction.includes('e')) {
        newWidth = Math.max(300, startWidth + deltaX);
      } else if (direction.includes('w')) {
        newWidth = Math.max(300, startWidth - deltaX);
      }

      if (direction.includes('s')) {
        newHeight = Math.max(200, startHeight + deltaY);
      } else if (direction.includes('n')) {
        newHeight = Math.max(200, startHeight - deltaY);
      }

      newWidth = Math.min(newWidth, window.innerWidth * 0.9);
      newHeight = Math.min(newHeight, window.innerHeight * 0.9);

      setDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('mouseup', () => {});
    };
  }, []);

  if (isMobile) {
    return (
      <motion.div
        ref={modalRef}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
        className="fixed inset-0 bg-black/95 border-t-2 border-green-700 z-50 flex flex-col"
        style={{ 
          height: 'calc(100% - 64px)',
          top: 0
        }}
      >
        <div className="bg-green-700 p-4 flex justify-between items-center">
          <span className="text-green-100 font-bold">{title}</span>
          <button onClick={onClose} className="text-green-100">
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-green-300">Loading...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      ref={modalRef}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
        bg-black/80 border-2 border-green-700 overflow-hidden shadow-lg z-50"
    >
      <motion.div
        className="bg-green-600 p-2 cursor-move flex justify-between items-center"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <span className="text-green-200">{title}</span>
        <button onClick={onClose} className="text-green-200 hover:text-green-100">
          <FaTimes />
        </button>
      </motion.div>

      <div className="p-4 overflow-auto h-[calc(100%-40px)] cursor-default">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-green-300">Loading...</p>
          </div>
        ) : (
          children
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize pointer-events-auto"
          onMouseDown={startResize('nw')}
        />
        <div
          className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize pointer-events-auto"
          onMouseDown={startResize('ne')}
        />
        <div
          className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize pointer-events-auto"
          onMouseDown={startResize('sw')}
        />
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize pointer-events-auto"
          onMouseDown={startResize('se')}
        />

        <div
          className="absolute top-0 left-4 right-4 h-2 cursor-n-resize pointer-events-auto"
          onMouseDown={startResize('n')}
        />
        <div
          className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize pointer-events-auto"
          onMouseDown={startResize('s')}
        />
        <div
          className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize pointer-events-auto"
          onMouseDown={startResize('w')}
        />
        <div
          className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize pointer-events-auto"
          onMouseDown={startResize('e')}
        />
      </div>
    </motion.div>
  );
}

const components = [
  {
    icon: FaWallet,
    label: "$LOST",
    Component: WalletComponent,
  },
  {
    icon: FaChartLine,
    label: "Memes",
    Component: TokensComponent,
  },
  {
    icon: FaMusic,
    label: "Music",
    Component: MusicComponent,
  },
  {
    icon: FaTerminal,
    label: "Terminal",
    Component: TerminalComponent,
  },
  {
    icon: FaGamepad,
    label: "Earn",
    Component: Game,
  }
];

export default function MatrixDesktop() {
  const [activeModals, setActiveModals] = useState(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [loadingComponent, setLoadingComponent] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const loadingTimerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Initialize audio
    audioRef.current = new Audio("/click.mp3");
    audioRef.current.volume = 0.5;
    
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const toggleModal = (Component) => {
    // Play sound effect
    playClickSound();

    if (!activeModals.has(Component)) {
      setLoadingComponent(Component);
      
      loadingTimerRef.current = setTimeout(() => {
        setLoadingComponent(null);
        loadingTimerRef.current = null;
      }, 500);
    }

    setActiveModals((prev) => {
      const newModals = new Set(prev);
      if (newModals.has(Component)) {
        newModals.delete(Component);
      } else {
        newModals.add(Component);
      }
      return newModals;
    });
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-black text-green-300 flex relative overflow-hidden">
      <MatrixBackground />

      <div className={`
        ${isMobile 
          ? 'fixed bottom-0 left-0 right-0 w-full h-16 bg-black/90 border-t border-green-800 flex flex-row justify-around items-center z-20' 
          : 'w-20 bg-black/50 border-r border-green-800 flex flex-col items-center pt-10 z-10'
        }
      `}>
        {components.map((item, index) => (
          <div
            key={index}
            onClick={() => toggleModal(item.Component)}
            className={`
              cursor-pointer hover:bg-green-800/30 transition-colors duration-200
              ${isMobile 
                ? 'p-2 flex flex-col items-center justify-center flex-1' 
                : 'p-4 w-full flex flex-col items-center mb-2'
              }
              ${activeModals.has(item.Component) ? "bg-green-800/30" : ""}
            `}
          >
            <item.icon className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-300`} />
            <p className={`text-xs ${isMobile ? 'mt-1' : 'mt-2'}`}>{item.label}</p>
          </div>
        ))}
      </div>

      {Array.from(activeModals).map((Component) => {
        const componentInfo = components.find((c) => c.Component === Component);
        return (
          <AppModal
            key={componentInfo.label}
            onClose={() => toggleModal(Component)}
            title={componentInfo.label}
            isLoading={loadingComponent === Component}
            isMobile={isMobile}
          >
            <Suspense
              fallback={
                <div className="text-green-300 font-omiofont1">Loading...</div>
              }
            >
              <Component isMobile={isMobile} />
            </Suspense>
          </AppModal>
        );
      })}
    </div>
  );
}