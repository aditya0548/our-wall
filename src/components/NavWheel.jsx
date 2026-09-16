import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, StickyNote, Mail } from 'lucide-react';
import '../styles/nav.css';

const features = [
  { id: 'chat',    label: 'Chat',       icon: MessageCircle, route: '/' },
  { id: 'notes',   label: 'Notes',      icon: StickyNote,    route: '/notes' },
  { id: 'open-when', label: 'Open When', icon: Mail, route: '/open-when' },
];

let globalIsVisible = false;
let globalPendingIndex = 0;
let globalLastInteraction = Date.now();

export default function NavWheel() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentIndex = features.findIndex(f => f.route === location.pathname);
  const actualIndex = currentIndex === -1 ? 0 : currentIndex;

  const [isVisible, setIsVisible] = useState(globalIsVisible);
  const [pendingIndex, setPendingIndex] = useState(globalIsVisible ? globalPendingIndex : actualIndex);
  const [wheelBounce, setWheelBounce] = useState(0);

  const commitTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const scrollAccumulator = useRef(0);
  const wheelBounceTimerRef = useRef(null);

  // Sync module state
  useEffect(() => {
    globalIsVisible = isVisible;
    globalPendingIndex = pendingIndex;
  }, [isVisible, pendingIndex]);

  const markInteraction = useCallback(() => {
    globalLastInteraction = Date.now();
    if (!globalIsVisible) {
      setIsVisible(true);
      globalIsVisible = true;
      
      // If we just became visible, start pendingIndex at current active
      setPendingIndex(actualIndex);
      globalPendingIndex = actualIndex;
    }
    
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      globalIsVisible = false;
    }, 3000);
  }, [actualIndex]);

  // Handle initialization on mount
  useEffect(() => {
    if (isVisible) {
      markInteraction();
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Activation hover & edge scroll
  useEffect(() => {
    let hoverTimer;
    
    const handleMouseMove = (e) => {
      if (e.clientX <= 40) {
        if (!globalIsVisible && !hoverTimer) {
          hoverTimer = setTimeout(() => {
            markInteraction();
          }, 300);
        }
      } else {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
          hoverTimer = null;
        }
      }
    };
    
    const handleWindowWheel = (e) => {
      if (e.clientX <= 40 && !globalIsVisible) {
         markInteraction();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWindowWheel);
      if (hoverTimer) clearTimeout(hoverTimer);
    };
  }, [markInteraction]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
        globalIsVisible = false;
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  // Commit selection after stopping scroll
  useEffect(() => {
    if (!isVisible) return;
    
    if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    
    if (pendingIndex !== actualIndex) {
      commitTimerRef.current = setTimeout(() => {
         const feature = features[pendingIndex];
         if (feature && feature.route !== location.pathname) {
             navigate(feature.route);
         }
      }, 500);
    }
    
    return () => {
      if (commitTimerRef.current) clearTimeout(commitTimerRef.current);
    };
  }, [pendingIndex, isVisible, actualIndex, navigate, location.pathname]);

  const handleWheelScroll = (e) => {
    if (!isVisible) return;
    
    markInteraction();
    
    scrollAccumulator.current += e.deltaY;
    const threshold = 40; 
    
    if (Math.abs(scrollAccumulator.current) >= threshold) {
       const steps = Math.sign(scrollAccumulator.current) * Math.floor(Math.abs(scrollAccumulator.current) / threshold);
       scrollAccumulator.current -= steps * threshold;
       
       setPendingIndex(prev => {
          const next = Math.max(0, Math.min(prev + steps, features.length - 1));
          if (next !== prev) {
             setWheelBounce(Math.sign(steps) * 4); // 4px bounce
             if (wheelBounceTimerRef.current) clearTimeout(wheelBounceTimerRef.current);
             wheelBounceTimerRef.current = setTimeout(() => setWheelBounce(0), 150);
          }
          return next;
       });
    }
  };

  const handleCardClick = (index) => {
    markInteraction();
    setPendingIndex(index);
    const feature = features[index];
    if (feature && feature.route !== location.pathname) {
       navigate(feature.route);
    }
  };

  const getCardStyle = (index) => {
    const diff = index - pendingIndex;
    
    if (diff === 0) {
      return { opacity: 1, scale: 1, y: 0, zIndex: 3 };
    } else if (diff === -1) {
      return { opacity: 0.6, scale: 0.85, y: -64, zIndex: 2 };
    } else if (diff === 1) {
      return { opacity: 0.6, scale: 0.85, y: 64, zIndex: 2 };
    } else {
      return { opacity: 0, scale: 0.5, y: diff * 64, zIndex: 1, pointerEvents: 'none' };
    }
  };

  // Determine indicator position inside the wheel
  // It moves up/down slightly based on the pending index
  const indicatorY = features.length > 1 
    ? (pendingIndex / (features.length - 1)) * 40 - 20 // -20px to +20px
    : 0;

  // Touch support for the wheel
  const touchStartY = useRef(0);
  const touchLastY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchLastY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = touchLastY.current - currentY; // positive when dragging up (scrolling down)
    touchLastY.current = currentY;
    
    // synthesize a wheel event object
    handleWheelScroll({ deltaY });
  };

  return (
    <>
      <div className={`nav-backdrop ${isVisible ? 'visible' : ''}`} />
      
      <div 
        className={`kawaii-nav-container ${isVisible ? 'visible' : ''}`}
        onMouseMove={markInteraction}
        onClick={markInteraction}
      >
        <div 
          className="scroll-wheel"
          onWheel={handleWheelScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ transform: `translateY(${wheelBounce}px)` }}
        >
          <div className="wheel-highlight" />
          <div className="wheel-ridges top" />
          <div className="wheel-groove" />
          <div 
            className="wheel-indicator" 
            style={{ transform: `translate(-50%, ${indicatorY}px)` }}
          />
          <div className="wheel-ridges bottom" />
        </div>

        <div className="carousel-container">
          {features.map((feature, i) => {
            const style = getCardStyle(i);
            const Icon = feature.icon;
            const isCurrent = i === pendingIndex;
            return (
               <div 
                 key={feature.id}
                 className={`carousel-card ${isCurrent ? 'current' : ''}`}
                 style={{
                   transform: `translateY(${style.y}px) scale(${style.scale})`,
                   opacity: style.opacity,
                   zIndex: style.zIndex,
                   pointerEvents: style.pointerEvents
                 }}
                 onClick={() => handleCardClick(i)}
               >
                 <Icon size={20} className="card-icon" />
                 <span className="card-label">{feature.label}</span>
               </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
