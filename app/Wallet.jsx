"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import eliza from '../public/images/eliza.webp';

const CyberpunkIntro = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  // Check screen size and update dynamically
  useEffect(() => {
    const updateScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setScreenWidth(window.innerWidth);
    };

    updateScreenSize();
    window.addEventListener("resize", updateScreenSize);

    return () => window.removeEventListener("resize", updateScreenSize);
  }, []);

  // Calculate responsive font sizes using vw with min/max clamps
  const topTextFontSize = `clamp(1.5rem, ${screenWidth * 0.04}px, 3rem)`; // Scales between 1.5rem and 3rem
  const lostOSFontSize = `clamp(3rem, ${screenWidth * 0.1}px, 6rem)`; // Scales between 3rem and 6rem

  // Calculate responsive dimensions for the image
  const imageSize = `clamp(10rem, ${screenWidth * 0.3}px, 15rem)`; // Scales between 10rem and 15rem
  const imageMarginTop = isMobile ? "1rem" : "2rem"; // Responsive margin
  const textMargin = isMobile ? "0.5rem" : "1rem"; // Margin between text elements

  return (
    <div
      className="min-h-screen text-white font-mono relative overflow-hidden flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#000000", // Greenish-black background to match the edited image
        backgroundImage: `radial-gradient(circle at 2px 2px, rgba(75, 243, 114, 0.2) 1px, transparent 0)`, // Subtle noise pattern
        backgroundSize: "20px 20px",
      }}
    >
      {/* Main content container */}
      <div className="flex flex-col items-center justify-center text-center">
        {/* Top text: "The Operating System for Degens" */}
        <div
          className="font-bold font-omiofont1 text-white"
          style={{
            fontSize: topTextFontSize,
            marginBottom: textMargin,
          }}
        >
          The Operating System for Degens
        </div>

        {/* Center text: "LostOS" */}
        <div
          className="font-bold font-omiofont1 text-[#03FF24]"
          style={{
            fontSize: lostOSFontSize,
            textShadow: "0 0 10px rgba(3, 255, 36, 0.5)",
            marginBottom: textMargin,
          }}
        >
          LostOS
        </div>

        {/* Mascot image rendered using Next.js Image component */}
        <Image
          src={eliza}
          alt="eliza"
          width={1080} // Base width (will be scaled by style)
          height={1080} // Base height (will be scaled by style)
          sizes="(max-width: 768px) 160px, 240px" // Responsive sizes for different viewports
          className="border border-green-500"
          style={{
            width: imageSize,
            height: imageSize,
            marginTop: imageMarginTop,
            boxShadow: "0 0 10px rgba(3, 255, 36, 0.3)",
            
          }}
          priority // Load eagerly since it's above the fold
        />

        {/* Powered by text with "elizaOS" as a link */}
        <div
          className="mt-4 text-gray-400 font-omiofont1 text-sm text-center"
          style={{
            fontSize: `clamp(0.75rem, ${screenWidth * 0.02}px, 1rem)`, // Scales between 0.75rem and 1rem
          }}
        >
          Powered by{" "}
          <Link
            href="https://www.elizaos.ai/" // Replace with the actual URL
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#03FF24] hover:underline hover:text-[#05cc2d] transition-colors"
            style={{
              textShadow: "0 0 5px rgba(3, 255, 36, 0.3)",
            }}
          >
            elizaOS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CyberpunkIntro;