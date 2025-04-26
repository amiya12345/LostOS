import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const MatrixDesktop = dynamic(() => import('./MatrixOs'), {
  ssr: false
});

const bootMessages = [
  "Initializing Lost OS v1.0.0...",
  "Loading kernel modules...",
  "Detecting hardware configuration...",
  "Initializing memory management...",
  "Scanning for system threats...",
  "Loading system drivers...",
  "Checking file system integrity...",
  "Loading security protocols...",
  "Running environment diagnostics...",
  "Loading user preferences...",
  "Initializing graphics subsystem...",
  "Running memory diagnostic...",
  "Initializing command interface...",
  "Running final checks...",
  "Starting Lost OS..."
];

// Original Desktop Loading Bar - unchanged
const DesktopLoadingBar = ({ progress }) => {
  const barWidth = 50; // Width of loading bar in characters
  const filledChars = Math.floor((progress / 100) * barWidth);
  const emptyChars = barWidth - filledChars;

  return (
    <div className="mt-4 font-mono">
      <div className="flex">
        <span>[</span>
        <span className="text-green-500">{'█'.repeat(filledChars)}</span>
        <span className="text-green-900">{'-'.repeat(emptyChars)}</span>
        <span>]</span>
        <span className="ml-2">{progress}%</span>
      </div>
    </div>
  );
};

// New Android-style Loading Bar for mobile
const AndroidLoadingBar = ({ progress }) => {
  return (
    <div className="mt-4 w-full">
      <div className="bg-green-900 h-1 rounded-full w-full">
        <div 
          className="bg-green-500 h-1 rounded-full transition-all duration-200 ease-in-out"
          style={{ width: `${progress}%` }} 
        />
      </div>
      <div className="text-right text-xs text-green-500 mt-1">{progress}%</div>
    </div>
  );
};

const BootSequence = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showDesktop, setShowDesktop] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // Boot sequence progression
  useEffect(() => {
    if (currentStep < bootMessages.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setLoadingProgress(prev => 
          Math.min(100, (currentStep + 1) * (100 / bootMessages.length))
        );
      }, Math.random() * (isMobile ? 200 : 300) + (isMobile ? 100 : 200));
      return () => clearTimeout(timer);
    } else {
      const finalTimer = setTimeout(() => {
        setShowDesktop(true);
      }, isMobile ? 800 : 1000);
      return () => clearTimeout(finalTimer);
    }
  }, [currentStep, isMobile]);

  // Auto-scroll to the latest message on mobile
  useEffect(() => {
    if (isMobile && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStep, isMobile]);

  if (showDesktop) {
    return <MatrixDesktop />;
  }

  // MOBILE VERSION
  if (isMobile) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="flex-1 flex flex-col max-w-full mx-auto">
          {/* Android-style compact logo */}
          <div className="mb-6 text-center">
            <div className="text-2xl font-bold">LOST OS</div>
            <div className="text-xs">v1.0.0</div>
          </div>
          
          {/* Messages container with Android-like styling */}
          <div className="flex-1 overflow-y-auto mb-4 text-sm">
            {bootMessages.slice(0, currentStep).map((message, index) => (
              <div key={index} className="mb-2 pl-2 border-l border-green-800">
                <span>{message}</span>
              </div>
            ))}
            {currentStep < bootMessages.length && (
              <div className="mb-2 pl-2 border-l border-green-800">
                {bootMessages[currentStep]}
                <span className="ml-1 animate-pulse">|</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Android-style loading bar */}
          <div className="mt-auto mb-8">
            <AndroidLoadingBar progress={Math.floor(loadingProgress)} />
          </div>
          
          {/* Android-style bottom pill */}
          <div className="fixed bottom-8 left-0 right-0 flex justify-center">
            <div className="h-1 w-16 bg-green-700 rounded-full" />
          </div>
        </div>
      </div>
    );
  }
  
  // DESKTOP VERSION - Keeping exactly as original
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 overflow-hidden">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <pre className="text-green-500">
{`
██╗      ██████╗ ███████╗████████╗     ██████╗ ███████╗
██║     ██╔═══██╗██╔════╝╚══██╔══╝    ██╔═══██╗██╔════╝
██║     ██║   ██║███████╗   ██║       ██║   ██║███████╗
██║     ██║   ██║╚════██║   ██║       ██║   ██║╚════██║
███████╗╚██████╔╝███████║   ██║       ╚██████╔╝███████║
╚══════╝ ╚═════╝ ╚══════╝   ╚═╝        ╚═════╝ ╚══════╝
`}
          </pre>
        </div>
        
        <div className="space-y-1">
          {bootMessages.slice(0, currentStep).map((message, index) => (
            <div key={index} className="flex">
              <span className="text-green-400 mr-2">$</span>
              <span>{message}</span>
            </div>
          ))}
          {currentStep < bootMessages.length && (
            <div className="flex">
              <span className="text-green-400 mr-2">$</span>
              <span>
                {bootMessages[currentStep]}
                {showCursor && '█'}
              </span>
            </div>
          )}
        </div>

        <DesktopLoadingBar progress={Math.floor(loadingProgress)} />
      </div>
    </div>
  );
};

export default BootSequence;