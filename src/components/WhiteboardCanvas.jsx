import React, { useRef, useEffect, useState } from 'react';

export default function WhiteboardCanvas({ strokes, onAddStroke }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  
  // Handle window resize
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        // Set actual pixel dimensions to match display dimensions
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        drawAllStrokes(); // Redraw after resize
      }
    };
    
    // Initial size
    resizeCanvas();
    
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes]); // Re-bind if strokes changes to ensure redraw gets latest strokes

  // Draw strokes when they change
  useEffect(() => {
    drawAllStrokes();
  }, [strokes, currentStroke]);

  const drawAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get accent color from computed styles of the canvas
    const computedStyle = getComputedStyle(document.body);
    const accentColor = computedStyle.getPropertyValue('--accent').trim();
    
    ctx.strokeStyle = accentColor || '#000'; // fallback
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw committed strokes
    strokes.forEach(stroke => drawStroke(ctx, stroke.points));
    
    // Draw current in-progress stroke
    if (currentStroke.length > 0) {
      drawStroke(ctx, currentStroke);
    }
  };
  
  const drawStroke = (ctx, points) => {
    if (!points || points.length === 0) return;
    
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      return [
        e.touches[0].clientX - rect.left,
        e.touches[0].clientY - rect.top
      ];
    } else {
      return [
        e.clientX - rect.left,
        e.clientY - rect.top
      ];
    }
  };

  const handlePointerDown = (e) => {
    // Prevent scrolling when drawing on touch
    if (e.type === 'touchstart') e.preventDefault();
    
    setIsDrawing(true);
    const coords = getCoordinates(e);
    if (coords) {
      setCurrentStroke([coords]);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    
    const coords = getCoordinates(e);
    if (coords) {
      setCurrentStroke(prev => [...prev, coords]);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      // Commit stroke
      onAddStroke(currentStroke);
      setCurrentStroke([]);
    }
  };

  return (
    <div className="whiteboard-canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseOut={handlePointerUp} // Also commit if mouse leaves canvas
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      />
    </div>
  );
}
