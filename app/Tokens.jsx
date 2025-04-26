'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Type, Download, Move, ZoomIn } from 'lucide-react';

const MemeGenerator = () => {
  const canvasRef = useRef(null);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [texts, setTexts] = useState([
    { id: 1, content: '', x: 200, y: 40, size: 30, colorScheme: 'green', alignment: 'center', style: 'normal', maxWidth: undefined, isDragging: false },
    { id: 2, content: '', x: 200, y: 360, size: 30, colorScheme: 'green', alignment: 'center', style: 'normal', maxWidth: undefined, isDragging: false },
  ]);
  const [selectedText, setSelectedText] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Predefined meme templates (replace with your own image paths)
  const templates = [
    'images/Trump_meme.png',
    'images/2.png',
    'images/3.png',
  ];

  // Color schemes for text
  const colorSchemes = {
    green: { fill: '#00ff00', stroke: '#000000' },
    blackWhite: { fill: '#000000', stroke: '#ffffff' },
    whiteBlack: { fill: '#ffffff', stroke: '#000000' },
  };

  // Font style options
  const fontStyles = ['normal', 'bold', 'italic'];

  // Load image helper function
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

  // Core rendering function
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
        ctx.textAlign = text.alignment;

        lines.forEach((line) => {
          const scheme = colorSchemes[text.colorScheme];
          ctx.fillStyle = scheme.fill;
          ctx.strokeStyle = scheme.stroke;
          ctx.lineWidth = 2 * scale;

          ctx.strokeText(line.toUpperCase(), text.x * scale, y);
          ctx.fillText(line.toUpperCase(), text.x * scale, y);

          y += lineHeight;
        });

        // Draw selection box (only on preview canvas)
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

    img.src = templates[selectedTemplate];
  };

  // Redraw canvas on state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    drawMeme(canvas);
  }, [texts, selectedTemplate, selectedText]);

  // Mouse event handlers for dragging
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

  // Adjust text size
  const adjustTextSize = (id, delta) => {
    setTexts(texts.map((text) =>
      text.id === id ? { ...text, size: Math.max(10, Math.min(60, text.size + delta)) } : text
    ));
  };

  // Add new text box
  const addTextBox = () => {
    const newId = texts.length + 1;
    const newY = 40 + (newId - 1) * 50; // Offset vertically
    setTexts([
      ...texts,
      {
        id: newId,
        content: '',
        x: 200,
        y: newY,
        size: 30,
        colorScheme: 'green',
        alignment: 'center',
        style: 'normal',
        maxWidth: undefined,
        isDragging: false,
      },
    ]);
  };

  // Export meme as 1080x1080 image
  const downloadMeme = async () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1080;
    tempCanvas.height = 1080;
    const ctx = tempCanvas.getContext('2d');

    const img = await loadImage(templates[selectedTemplate]);
    ctx.drawImage(img, 0, 0, 1080, 1080);

    const scale = 1080 / 400;

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
      ctx.textAlign = text.alignment;

      lines.forEach((line) => {
        const scheme = colorSchemes[text.colorScheme];
        ctx.fillStyle = scheme.fill;
        ctx.strokeStyle = scheme.stroke;
        ctx.lineWidth = 2 * scale;

        ctx.strokeText(line.toUpperCase(), text.x * scale, y);
        ctx.fillText(line.toUpperCase(), text.x * scale, y);

        y += lineHeight;
      });
    });

    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };

  // Component UI
  return (
    <div className="min-h-screen bg-black text-green-400 p-6 font-omiofont1">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Terminal className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Meme Generator</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls Section */}
          <div className="space-y-4">
            {texts.map((text, index) => (
              <div key={text.id} className="border border-green-500 p-4 bg-black/50">
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4" />
                  <label className="text-sm">TEXT {index + 1}</label>
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
                <div className="flex gap-2 mt-2">
                  <select
                    value={text.colorScheme}
                    onChange={(e) =>
                      setTexts(texts.map((t) =>
                        t.id === text.id ? { ...t, colorScheme: e.target.value } : t
                      ))
                    }
                    className="bg-black border border-green-500 p-2 text-green-400"
                  >
                    <option value="green">Green</option>
                    <option value="blackWhite">Black</option>
                    <option value="whiteBlack">White</option>
                  </select>
                  <select
                    value={text.alignment}
                    onChange={(e) =>
                      setTexts(texts.map((t) =>
                        t.id === text.id ? { ...t, alignment: e.target.value } : t
                      ))
                    }
                    className="bg-black border border-green-500 p-2 text-green-400"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
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
                </div>
                <div className="flex gap-2 mt-2">
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
            ))}

            <button
              onClick={addTextBox}
              className="w-full border border-green-500 p-2 hover:bg-green-500 hover:text-black flex items-center justify-center gap-2"
            >
              <Type className="w-4 h-4" />
              Add Text Box
            </button>

            <div className="border border-green-500 p-4 bg-black/50">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4" />
                <label className="text-sm">Template</label>
              </div>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(Number(e.target.value))}
                className="w-full bg-black border border-green-500 p-2 text-green-400"
              >
                <option value={0}>Template 1</option>
                <option value={1}>Template 2</option>
                <option value={2}>Template 3</option>
              </select>
            </div>

            <button
              onClick={downloadMeme}
              className="w-full border border-green-500 p-2 hover:bg-green-500 hover:text-black flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Meme
            </button>
          </div>

          {/* Preview Canvas */}
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
            <div className="flex items-center gap-2 mt-2">
              <Move className="w-4 h-4" />
              <span className="text-sm">Drag to position text</span>
            </div>
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              <span className="text-sm">Use +/- to resize text</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeGenerator;