'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Type, Download, Move, ZoomIn, Plus } from 'lucide-react';
import { FaCopy } from 'react-icons/fa';

// Audio singleton for retro beep
const audioSingleton = (() => {
  const audio = new Audio("/171697-select.mp3");
  audio.volume = 0.9;
  return {
    play: () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => console.log("Audio playback failed:", error));
      }
    },
  };
})();

const MemeGenerator = () => {
  const canvasRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [texts, setTexts] = useState([
    { id: 1, content: '', x: 200, y: 40, size: 30, fill: '#00ff00', stroke: '#000000', alignment: 'center', style: 'normal', maxWidth: undefined, isDragging: false },
    { id: 2, content: '', x: 200, y: 360, size: 30, fill: '#00ff00', stroke: '#000000', alignment: 'center', style: 'normal', maxWidth: undefined, isDragging: false },
  ]);
  const [selectedText, setSelectedText] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(1); // Track the active text box tab

  // Template data
  const templates = [
    { name: 'GfBf', src: 'images/GfBf.webp' },
    { name: 'RightMeme', src: 'images/RightMeme.webp' },
    { name: 'TrumpApproval', src: 'images/TrumpApproval.webp' },
    { name: 'DirectionMeme', src: 'images/DirectionMeme.webp' },
  ];

  // Fill color palette (5 colors)
  const fillPalette = [
    { name: 'Black', hex: '#000000' },
    { name: 'Green', hex: '#00ff00' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Red', hex: '#ff0000' },
    { name: 'Yellow', hex: '#ffff00' },
  ];

  // Stroke color palette (black and white only)
  const strokePalette = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#ffffff' },
  ];

  // Font styles
  const fontStyles = ['normal', 'bold', 'italic'];

  // Load image helper
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Text wrapping logic
  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Core rendering
  const drawMeme = (canvas, scale = 1) => {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      texts.forEach((text) => {
        let lines = text.content.split('\n');
        if (text.maxWidth) {
          const wrappedLines = [];
          lines.forEach((line) => {
            wrappedLines.push(...wrapText(ctx, line, text.maxWidth * scale));
          });
          lines = wrappedLines;
        }
        const lineHeight = text.size * 1.2 * scale;
        let y = text.y * scale - (lines.length * lineHeight) / 2 + lineHeight / 2;
        ctx.font = `${text.style} ${text.size * scale}px "Courier New"`;
        ctx.textAlign = 'center'; // Hardcode to center
        lines.forEach((line) => {
          ctx.fillStyle = text.fill;
          ctx.strokeStyle = text.stroke;
          ctx.lineWidth = 2 * scale;
          ctx.strokeText(line.toUpperCase(), text.x * scale, y);
          ctx.fillText(line.toUpperCase(), text.x * scale, y);
          y += lineHeight;
        });
        if (selectedText === text.id && scale === 1) {
          const metrics = ctx.measureText(text.content.toUpperCase());
          const height = lines.length * lineHeight;
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            (text.x - metrics.width / 2 - 5) * scale,
            (text.y - height / 2 - 5) * scale,
            (metrics.width + 10) * scale,
            (height + 10) * scale
          );
        }
      });
    };
    img.src = templates[selectedTemplate].src;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    drawMeme(canvas);
  }, [texts, selectedTemplate, selectedText]);

  // Dragging handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    texts.forEach((text) => {
      let lines = text.content.split('\n');
      if (text.maxWidth) {
        const ctx = canvas.getContext('2d');
        ctx.font = `${text.style} ${text.size}px "Courier New"`;
        const wrappedLines = [];
        lines.forEach((line) => {
          wrappedLines.push(...wrapText(ctx, line, text.maxWidth));
        });
        lines = wrappedLines;
      }
      const lineHeight = text.size * 1.2;
      const totalHeight = lines.length * lineHeight;
      const ctx = canvas.getContext('2d');
      ctx.font = `${text.style} ${text.size}px "Courier New"`;
      const metrics = ctx.measureText(text.content.toUpperCase());
      const width = metrics.width;
      if (
        x >= text.x - width / 2 - 5 &&
        x <= text.x + width / 2 + 5 &&
        y >= text.y - totalHeight / 2 - 5 &&
        y <= text.y + totalHeight / 2 + 5
      ) {
        setSelectedText(text.id);
        setIsDragging(true);
        setLastMousePos({ x, y });
      }
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedText) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - lastMousePos.x;
      const dy = y - lastMousePos.y;
      setTexts(texts.map((text) =>
        text.id === selectedText ? { ...text, x: text.x + dx, y: text.y + dy } : text
      ));
      setLastMousePos({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const adjustTextSize = (id, delta) => {
    setTexts(texts.map((text) =>
      text.id === id ? { ...text, size: Math.max(10, Math.min(60, text.size + delta)) } : text
    ));
    audioSingleton.play();
  };

  const addTextBox = () => {
    const newId = texts.length + 1;
    const newY = 40 + (newId - 1) * 50;
    setTexts([
      ...texts,
      {
        id: newId,
        content: '',
        x: 200,
        y: newY,
        size: 30,
        fill: '#00ff00',
        stroke: '#000000',
        alignment: 'center',
        style: 'normal',
        maxWidth: undefined,
        isDragging: false,
      },
    ]);
    setActiveTab(newId); // Switch to the new tab
    audioSingleton.play();
  };

  // Update text color
  const updateTextColor = (id, type, color) => {
    setTexts(texts.map((text) =>
      text.id === id ? { ...text, [type]: color } : text
    ));
    audioSingleton.play();
  };

  // Generate meme blob
  const generateMemeBlob = async (scale) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400 * scale;
    tempCanvas.height = 400 * scale;
    const ctx = tempCanvas.getContext('2d');
    const img = await loadImage(templates[selectedTemplate].src);
    ctx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    const textScale = scale;
    texts.forEach((text) => {
      let lines = text.content.split('\n');
      if (text.maxWidth) {
        const wrappedLines = [];
        lines.forEach((line) => {
          wrappedLines.push(...wrapText(ctx, line, text.maxWidth * textScale));
        });
        lines = wrappedLines;
      }
      const lineHeight = text.size * 1.2 * textScale;
      let y = text.y * textScale - (lines.length * lineHeight) / 2 + lineHeight / 2;
      ctx.font = `${text.style} ${text.size * textScale}px "Courier New"`;
      ctx.textAlign = 'center'; // Hardcode to center
      lines.forEach((line) => {
        ctx.fillStyle = text.fill;
        ctx.strokeStyle = text.stroke;
        ctx.lineWidth = 2 * textScale;
        ctx.strokeText(line.toUpperCase(), text.x * textScale, y);
        ctx.fillText(line.toUpperCase(), text.x * textScale, y);
        y += lineHeight;
      });
    });
    return new Promise((resolve) => {
      tempCanvas.toBlob(resolve, 'image/png');
    });
  };

  const downloadMeme = async () => {
    const blob = await generateMemeBlob(1080 / 400);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    audioSingleton.play();
  };

  const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      alert('Clipboard API not supported in this browser.');
      return;
    }
    try {
      const blob = await generateMemeBlob(1080 / 400);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      audioSingleton.play();
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy meme to clipboard.');
    }
  };

  // UI
  return (
    <div className="min-h-screen bg-black text-green-400 p-6 font-omiofont1">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Meme Generator</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls with Tabs */}
          <div className="border border-green-500 p-4 bg-black/50">
            <div className="flex overflow-x-auto border-b border-green-500">
              {texts.map((text) => (
                <button
                  key={text.id}
                  onClick={() => {
                    setActiveTab(text.id);
                    audioSingleton.play();
                  }}
                  className={`px-4 py-2 text-sm border-r border-green-500 ${
                    activeTab === text.id ? 'bg-green-500 text-black' : 'bg-black text-green-400'
                  } hover:bg-green-400 hover:text-black transition-colors`}
                >
                  Text {text.id}
                </button>
              ))}
              <button
                onClick={addTextBox}
                className="px-4 py-2 text-sm bg-black text-green-400 hover:bg-green-400 hover:text-black transition-colors flex items-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {/* Display controls for the active tab */}
            {texts.map((text) => (
              activeTab === text.id && (
                <div key={text.id} className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4" />
                    <label className="text-sm">TEXT {text.id}</label>
                  </div>
                  <textarea
                    value={text.content}
                    onChange={(e) =>
                      setTexts(texts.map((t) =>
                        t.id === text.id ? { ...t, content: e.target.value } : t
                      ))
                    }
                    className="w-full bg-black border border-green-500 p-2 text-green-400 focus:outline-none"
                    rows="3"
                    placeholder="Enter your text..."
                  />
                  {/* Fill and Stroke Colors in the Same Line */}
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <label className="text-sm">Fill Color</label>
                        <div className="flex gap-1 mt-1">
                          {fillPalette.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => updateTextColor(text.id, 'fill', color.hex)}
                              className="w-6 h-6 border border-green-500"
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} Fill`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm">Stroke Color</label>
                        <div className="flex gap-1 mt-1">
                          {strokePalette.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => updateTextColor(text.id, 'stroke', color.hex)}
                              className="w-6 h-6 border border-green-500"
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} Stroke`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Text Size, Position, and Style in a Different Line */}
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={text.style}
                      onChange={(e) =>
                        setTexts(texts.map((t) =>
                          t.id === text.id ? { ...t, style: e.target.value } : t
                        ))
                      }
                      className="bg-black border border-green-500 p-2 text-green-400"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="italic">Italic</option>
                    </select>
                    <input
                      type="number"
                      value={text.maxWidth || ''}
                      onChange={(e) =>
                        setTexts(texts.map((t) =>
                          t.id === text.id ? { ...t, maxWidth: e.target.value ? Number(e.target.value) : undefined } : t
                        ))
                      }
                      className="bg-black border border-green-500 p-2 text-green-400 w-24"
                      placeholder="Max Width"
                    />
                    <button
                      onClick={() => adjustTextSize(text.id, -2)}
                      className="border border-green-500 p-2 hover:bg-green-500 hover:text-black"
                    >
                      -
                    </button>
                    <button
                      onClick={() => adjustTextSize(text.id, 2)}
                      className="border border-green-500 p-2 hover:bg-green-500 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
          {/* Preview */}
          <div className="space-y-4">
            <div className="border border-green-500 p-4 bg-black/50">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4" />
                <label className="text-sm">Template</label>
              </div>
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-black">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedTemplate(index);
                      audioSingleton.play();
                    }}
                    className={`flex-none w-24 p-2 snap-center ${
                      selectedTemplate === index ? 'border-2 border-green-500' : 'border border-transparent'
                    } hover:border-green-400 transition-colors`}
                  >
                    <img
                      src={template.src}
                      alt={template.name}
                      className="w-20 h-20 object-cover"
                    />
                    <p className="text-xs mt-1 text-center truncate">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-green-500 p-4 bg-black/50">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full bg-black cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4" />
                  <span className="text-sm">Drag to position text</span>
                </div>
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4" />
                  <span className="text-sm">Use +/- to resize text</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={copyToClipboard}
                className="w-full border border-green-500 p-2 hover:bg-green-500 hover:text-black flex items-center justify-center gap-2"
              >
                <FaCopy className="w-4 h-4" />
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={downloadMeme}
                className="w-full border border-green-500 p-2 hover:bg-green-500 hover:text-black flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Meme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;