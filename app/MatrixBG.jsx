'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react';

const tokens = [
  '$SOL', '$BONK', '$DOGE', '$SHIB', '$PEPE', 
  '$USDC', '$BUTT', '$ETH', '$JELLY', '$OP', 
  '$AVAX', '$UNI', '$LINK', '$XRP', '$DOT',
  '$CAR', '$TRUMP', '$VINE', '$NEAR', '$BLUR',
  '$GMX', '$UAE', '$MKR', '$FRANKY', '$FART',
  '$RUNE', '$AAVE', '$YFI', '$COMP', '$BAT',
  '$FIL', '$ZRX', '$KNC', '$AUDIO', '$FLOW',
  '$GRT', '$ALGO', '$DASH', '$SAND', '$AXS'
];

const MatrixBackground = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });
  const [streams, setStreams] = useState([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const resizeTimeoutRef = useRef(null);
  
  // Memoize column width calculation to avoid recalculating unnecessarily
  const columnWidth = useMemo(() => 80, []);
  
  // Create a single stream with memoized parameters
  const createStream = useMemo(() => (index) => {
    const totalColumns = Math.floor(dimensions.width / columnWidth);
    
    return {
      id: index,
      chars: Array(Math.floor(5 + Math.random() * 10)).fill(null).map(() => ({
        char: tokens[Math.floor(Math.random() * tokens.length)],
        opacity: Math.random() * 0.5 + 0.5
      })),
      x: (index % totalColumns) * columnWidth,
      y: -1000 + Math.random() * -1000,
      speed: 0.9 + Math.random() * 2,
      lastUpdate: 0
    };
  }, [dimensions.width, columnWidth]);
  
  // Initialize streams based on screen dimensions
  useEffect(() => {
    const totalColumns = Math.floor(dimensions.width / columnWidth);
    const initialStreams = Array(totalColumns).fill(null).map((_, i) => createStream(i));
    setStreams(initialStreams);
  }, [dimensions.width, columnWidth, createStream]);
  
  // Handle animation with optimized frame rate
  useEffect(() => {
    const updateStreams = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = timestamp - lastTimeRef.current;
      
      // Only update if enough time has passed (throttling for performance)
      if (deltaTime > 16) { // target ~60fps
        setStreams(prevStreams => 
          prevStreams.map(stream => {
            const newY = stream.y + (stream.speed * deltaTime * 0.1);
            
            if (newY > dimensions.height + 1000) {
              return createStream(stream.id);
            }
            
            // Only update characters occasionally to improve performance
            const now = timestamp;
            let newChars = stream.chars;
            
            if (now - stream.lastUpdate > 1000) { // update tokens every second
              newChars = stream.chars.map(charObj => {
                if (Math.random() < 0.05) { 
                  return {
                    char: tokens[Math.floor(Math.random() * tokens.length)],
                    opacity: charObj.opacity
                  };
                }
                return charObj;
              });
            }
            
            return {
              ...stream,
              y: newY,
              chars: newChars,
              lastUpdate: now - stream.lastUpdate > 1000 ? now : stream.lastUpdate
            };
          })
        );
        
        lastTimeRef.current = timestamp;
      }
      
      animationRef.current = requestAnimationFrame(updateStreams);
    };
    
    animationRef.current = requestAnimationFrame(updateStreams);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions.height, createStream]);
  
  // Handle window resize with debounce
  useEffect(() => {
    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      resizeTimeoutRef.current = setTimeout(() => {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 250); // Debounce resize events
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="fixed inset-0 bg-black overflow-hidden pointer-events-none z-0">
      {streams.map(stream => (
        <div
          key={stream.id}
          className="absolute whitespace-pre font-omiofont text-sm leading-none"
          style={{
            transform: `translate(${stream.x}px, ${stream.y}px)`,
            textShadow: '0 0 8px rgba(32, 255, 77, 0.8)',
            willChange: 'transform'
          }}
        >
          {stream.chars.map((charObj, i) => (
            <div
              key={i}
              className="text-green-400"
              style={{
                opacity: i === 0 ? 1 : charObj.opacity,
                color: i === 0 ? '#86efac' : undefined,
                transform: `translateY(${i * 24}px)` // Increased spacing between tokens
              }}
            >
              {charObj.char}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MatrixBackground;