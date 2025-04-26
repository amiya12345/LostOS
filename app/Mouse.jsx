"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';

const MatrixCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [cursorType, setCursorType] = useState('default');
  const trailCounterRef = useRef(0);
  
  const matrixChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン".split("");
  
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    // Get the element under the cursor
    const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
    const cursorStyle = window.getComputedStyle(elementUnderCursor).cursor;
    
    // Update cursor type based on the element's cursor style
    setCursorType(cursorStyle);
    
    // Increment counter for unique key
    trailCounterRef.current += 1;
    
    const newChar = {
      id: trailCounterRef.current, // Use counter instead of Date.now()
      char: matrixChars[Math.floor(Math.random() * matrixChars.length)],
      x: e.clientX,
      y: e.clientY,
      opacity: 1
    };
    
    setTrail(prevTrail => [...prevTrail, newChar].slice(-20));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTrail(prevTrail =>
        prevTrail.map(char => ({
          ...char,
          y: char.y + 2,
          opacity: char.opacity - 0.02
        })).filter(char => char.opacity > 0)
      );
    }, 16);

    return () => clearInterval(intervalId);
  }, []);

  const getCursorRotation = () => {
    switch(cursorType) {
      case 'nw-resize': return '315deg';
      case 'n-resize': return '0deg';
      case 'ne-resize': return '45deg';
      case 'e-resize': return '90deg';
      case 'se-resize': return '135deg';
      case 'sw-resize': return '225deg';
      case 'w-resize': return '270deg';
      default: return '0deg';
    }
  };

  return (
    <>
      {/* Custom cursor */}
      <div
        className="fixed pointer-events-none mix-blend-screen"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          zIndex: 9999,
          transform: `translate(-50%, -50%) rotate(${getCursorRotation()})`,
        }}
      >
        {cursorType.includes('resize') ? (
          <div className="w-4 h-4">
            <div className="absolute w-4 h-0.5 bg-green-500 top-1/2 -translate-y-1/2" />
            <div className="absolute h-4 w-0.5 bg-green-500 left-1/2 -translate-x-1/2" />
          </div>
        ) : cursorType === 'move' || cursorType === 'grab' ? (
          <div className="w-6 h-6 border-2 border-green-500 rounded-full">
            <div className="absolute w-4 h-0.5 bg-green-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute h-4 w-0.5 bg-green-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        ) : (
          <div className="w-6 h-6">
            <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-pulse" />
            <div className="absolute inset-1 border border-green-300 rounded-full" />
          </div>
        )}
      </div>

      {/* Trailing characters */}
      {trail.map(({ id, char, x, y, opacity }) => (
        <div
          key={id} // Now using unique counter-based id
          className="fixed font-bold pointer-events-none mix-blend-screen"
          style={{
            left: x,
            top: y,
            opacity,
            color: '#00ff00',
            textShadow: '0 0 5px #00ff00',
            transform: 'translate(-50%, -50%)',
            zIndex: 9998
          }}
        >
          {char}
        </div>
      ))}

      {/* Global style to hide default cursor */}
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        
        iframe {
          cursor: auto !important;
        }
      `}</style>
    </>
  );
};

export default MatrixCursor;