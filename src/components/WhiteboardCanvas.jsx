import React, { useRef, useEffect, useState } from 'react';
import { COLORS } from './WhiteboardControls';

export default function WhiteboardCanvas({ 
  strokes, 
  onAddStroke, 
  onDeleteStroke,
  selectedColor,
  selectedSize,
  selectedTool
}) {
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
  }, [strokes, selectedColor, selectedSize, selectedTool]); // Re-bind if strokes changes to ensure redraw gets latest strokes

  // Draw strokes when they change
  useEffect(() => {
    drawAllStrokes();
  }, [strokes, currentStroke, selectedColor, selectedSize, selectedTool]);

  const getColorHex = (colorId) => {
    const c = COLORS.find(c => c.id === colorId);
    return c ? c.value : '#000';
  };

  const drawAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw committed strokes
    strokes.forEach(stroke => {
      ctx.strokeStyle = getColorHex(stroke.color);
      ctx.lineWidth = stroke.size || 4; // default to 4 if missing
      drawStroke(ctx, stroke.points);
    });
    
    // Draw current in-progress stroke
    if (currentStroke.length > 0) {
      if (selectedTool === 'eraser') {
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)'; // visual feedback for eraser
        ctx.lineWidth = 20;
      } else {
        ctx.strokeStyle = getColorHex(selectedColor);
        ctx.lineWidth = selectedSize;
      }
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

  const distSq = (p1, p2) => (p1[0] - p2[0])**2 + (p1[1] - p2[1])**2;

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentStroke.length === 0) return;

    if (selectedTool === 'eraser') {
      const ERASER_RADIUS = 10; // 20px width / 2
      const strokesToDelete = new Set();
      
      // Hit-test eraser stroke against all existing strokes
      for (const stroke of strokes) {
        const STROKE_RADIUS = (stroke.size || 4) / 2;
        const HIT_DIST_SQ = (ERASER_RADIUS + STROKE_RADIUS) ** 2;
        
        // Simple point-to-point distance check O(n*m)
        let hit = false;
        for (const ep of currentStroke) {
          for (const sp of stroke.points) {
            if (distSq(ep, sp) <= HIT_DIST_SQ) {
              hit = true;
              break;
            }
          }
          if (hit) break;
        }
        
        if (hit) {
          strokesToDelete.add(stroke.id);
        }
      }
      
      strokesToDelete.forEach(id => onDeleteStroke(id));
      setCurrentStroke([]);
    } else {
      // Commit stroke
      onAddStroke(currentStroke, selectedColor, selectedSize);
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
