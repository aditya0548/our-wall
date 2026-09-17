import React, { useRef, useEffect, useState } from 'react';
import { COLORS } from './WhiteboardControls';

export default function WhiteboardCanvas({ 
  strokes, 
  onAddStroke, 
  onDeleteStroke,
  onReplaceStroke,
  selectedColor,
  selectedSize,
  selectedTool
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Parallel arrays for the current stroke
  const [currentStroke, setCurrentStroke] = useState([]);
  const [currentPressures, setCurrentPressures] = useState([]);
  
  useEffect(() => {
    const resizeCanvas = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        drawAllStrokes(); 
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [strokes, selectedColor, selectedSize, selectedTool]); 

  useEffect(() => {
    drawAllStrokes();
  }, [strokes, currentStroke, currentPressures, selectedColor, selectedSize, selectedTool]);

  const getColorHex = (colorId) => {
    const c = COLORS.find(c => c.id === colorId);
    return c ? c.value : '#000';
  };

  const drawAllStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    strokes.forEach(stroke => {
      ctx.strokeStyle = getColorHex(stroke.color);
      const baseSize = stroke.size || 4;
      drawSmoothStroke(ctx, stroke.points, stroke.pressures, baseSize);
    });
    
    if (currentStroke.length > 0) {
      if (selectedTool === 'eraser') {
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)'; 
        drawSmoothStroke(ctx, currentStroke, null, 20); // 20px uniform width
      } else {
        ctx.strokeStyle = getColorHex(selectedColor);
        drawSmoothStroke(ctx, currentStroke, currentPressures, selectedSize);
      }
    }
  };
  
  const drawSmoothStroke = (ctx, points, pressures, baseSize) => {
    if (!points || points.length === 0) return;
    
    if (points.length === 1) {
       ctx.lineWidth = pressures ? getWidth(baseSize, pressures[0]) : baseSize;
       ctx.beginPath();
       ctx.moveTo(points[0][0], points[0][1]);
       ctx.lineTo(points[0][0], points[0][1]);
       ctx.stroke();
       return;
    }

    let prevMid = points[0];

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const mid = i === points.length - 1 ? p2 : [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

      const pr1 = pressures ? pressures[i - 1] : 1.0;
      const pr2 = pressures ? pressures[i] : 1.0;
      const avgPressure = (pr1 + pr2) / 2;
      
      ctx.lineWidth = getWidth(baseSize, avgPressure);
      ctx.beginPath();
      ctx.moveTo(prevMid[0], prevMid[1]);
      ctx.quadraticCurveTo(p1[0], p1[1], mid[0], mid[1]);
      ctx.stroke();

      prevMid = mid;
    }
  };

  const getWidth = (baseSize, pressure) => {
    const p = pressure ?? 1.0;
    const MIN_MULT = 0.3;
    const MAX_MULT = 1.7;
    return baseSize * (MIN_MULT + p * (MAX_MULT - MIN_MULT));
  };

  const getEventData = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    let x, y, pressure = 1.0;

    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
      // standard touch doesn't report pressure cleanly in all browsers, default to 1.0
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (e.pointerType === 'pen' && e.pressure !== undefined) {
        pressure = e.pressure;
      }
    }
    return { pos: [x, y], pressure };
  };

  const handlePointerDown = (e) => {
    if (e.type === 'touchstart') e.preventDefault();
    setIsDrawing(true);
    const data = getEventData(e);
    if (data) {
      setCurrentStroke([data.pos]);
      setCurrentPressures([data.pressure]);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    
    const data = getEventData(e);
    if (data) {
      setCurrentStroke(prev => [...prev, data.pos]);
      setCurrentPressures(prev => [...prev, data.pressure]);
    }
  };

  const distSq = (p1, p2) => (p1[0] - p2[0])**2 + (p1[1] - p2[1])**2;

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentStroke.length === 0) return;

    if (selectedTool === 'eraser') {
      const ERASER_RADIUS = 10;
      
      for (const stroke of strokes) {
        const STROKE_RADIUS = (stroke.size || 4) / 2;
        const HIT_DIST_SQ = (ERASER_RADIUS + STROKE_RADIUS) ** 2;
        
        const hitIndices = [];
        for (let i = 0; i < stroke.points.length; i++) {
          const sp = stroke.points[i];
          let hit = false;
          for (const ep of currentStroke) {
            if (distSq(ep, sp) <= HIT_DIST_SQ) {
              hit = true;
              break;
            }
          }
          if (hit) hitIndices.push(i);
        }
        
        if (hitIndices.length > 0) {
          const fragmentsToInsert = [];
          let currentFragmentPoints = [];
          let currentFragmentPressures = [];
          
          for (let i = 0; i < stroke.points.length; i++) {
            if (hitIndices.includes(i)) {
              if (currentFragmentPoints.length >= 2) {
                fragmentsToInsert.push({
                  points: currentFragmentPoints,
                  pressures: stroke.pressures ? currentFragmentPressures : null,
                  color: stroke.color,
                  size: stroke.size
                });
              }
              currentFragmentPoints = [];
              currentFragmentPressures = [];
            } else {
              currentFragmentPoints.push(stroke.points[i]);
              if (stroke.pressures) {
                currentFragmentPressures.push(stroke.pressures[i]);
              }
            }
          }
          if (currentFragmentPoints.length >= 2) {
             fragmentsToInsert.push({
                points: currentFragmentPoints,
                pressures: stroke.pressures ? currentFragmentPressures : null,
                color: stroke.color,
                size: stroke.size
             });
          }
          
          onReplaceStroke(stroke.id, fragmentsToInsert);
        }
      }
    } else {
      // Commit stroke
      onAddStroke(currentStroke, currentPressures, selectedColor, selectedSize);
    }
    
    setCurrentStroke([]);
    setCurrentPressures([]);
  };

  return (
    <div className="whiteboard-canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp} 
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}
