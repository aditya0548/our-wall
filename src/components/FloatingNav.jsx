import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, StickyNote, Mail, Palette, Gamepad2, Sparkles, X } from 'lucide-react';
import '../styles/nav.css';

const NAV_ITEMS = [
  { id: 'chat',       label: 'Chat',       icon: MessageCircle, route: '/' },
  { id: 'notes',      label: 'Notes',      icon: StickyNote,    route: '/notes' },
  { id: 'open-when',  label: 'Open When',  icon: Mail,          route: '/open-when' },
  { id: 'whiteboard', label: 'Whiteboard', icon: Palette,       route: '/whiteboard' },
  { id: 'games',      label: 'Games',      icon: Gamepad2,      route: '/games' },
];

const STORAGE_KEY = 'our-wall-fab-position';

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fabPosition, setFabPosition] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const clampedY = Math.max(60, Math.min(parsed.y, h - 120));
        const snapToLeft = parsed.x < w / 2;
        const snapX = snapToLeft ? 16 : w - 56 - 16;
        return { x: snapX, y: clampedY };
      } catch (e) {}
    }
    return { x: w - 72, y: h - 100 };
  });

  const menuRef = useRef(null);
  const fabRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const idleTimerRef = useRef(null);
  const dragState = useRef({
    startX: 0,
    startY: 0,
    fabStartX: 0,
    fabStartY: 0,
    isDragging: false,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setFabPosition((prev) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const clampedY = Math.max(60, Math.min(prev.y, h - 120));
        const snapToLeft = prev.x < w / 2;
        const snapX = snapToLeft ? 16 : w - 56 - 16;
        return { x: snapX, y: clampedY };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const resetIdleTimer = () => {
    setIsIdle(false);
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 3000);
  };

  useEffect(() => {
    resetIdleTimer();
    return () => clearTimeout(idleTimerRef.current);
  }, []);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.type.includes('mouse')) return; // Only left click
    
    resetIdleTimer();
    
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      fabStartX: fabPosition.x,
      fabStartY: fabPosition.y,
      isDragging: false,
    };
    
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    resetIdleTimer();
    const state = dragState.current;
    
    if (!e.target.hasPointerCapture(e.pointerId)) return;

    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (!state.isDragging && Math.hypot(dx, dy) > 5) {
      state.isDragging = true;
      setIsDragging(true);
    }

    if (state.isDragging) {
      setFabPosition({
        x: state.fabStartX + dx,
        y: state.fabStartY + dy,
      });
    }
  };

  const handlePointerUp = (e) => {
    resetIdleTimer();
    const state = dragState.current;
    
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId);
    }

    if (state.isDragging) {
      // Snap to nearest edge
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fabCenterX = fabPosition.x + 28;
      const snapToLeft = fabCenterX < w / 2;
      const snapX = snapToLeft ? 16 : w - 56 - 16;
      
      const clampedY = Math.max(60, Math.min(fabPosition.y, h - 120));
      
      const newPos = { x: snapX, y: clampedY };
      setFabPosition(newPos);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));
    } else {
      // Treat as tap
      handleToggle();
    }
    
    state.isDragging = false;
    setIsDragging(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 150);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const handleNavigate = (route) => {
    navigate(route);
    handleClose();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        fabRef.current &&
        !fabRef.current.contains(event.target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
        fabRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Hidden routes
  const hiddenRoutes = ['/login', '/setup', '/forgot-password', '/reset-password', '/settings'];
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  const isOnLeftEdge = fabPosition.x < window.innerWidth / 2;
  const menuStyle = {};
  if (isOnLeftEdge) {
    menuStyle.left = fabPosition.x + 56 + 8;
  } else {
    menuStyle.right = window.innerWidth - fabPosition.x + 8;
  }
  
  // Vertically
  // Simplify: anchor the menu's bottom to the FAB's top + 8px, unless the FAB is very high (then anchor top).
  const isHigh = fabPosition.y < 280; // 220px (menu height approximate) + 60px
  if (isHigh) {
    menuStyle.top = Math.max(16, fabPosition.y); // anchor top near FAB
  } else {
    menuStyle.bottom = window.innerHeight - fabPosition.y + 8; // anchor bottom near FAB
  }

  const shouldFade = isIdle && !isOpen && !isDragging;

  return (
    <>
      <button
        ref={fabRef}
        className={`floating-fab ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          left: fabPosition.x,
          top: fabPosition.y,
          opacity: shouldFade ? 0.6 : 1,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={resetIdleTimer}
        onMouseLeave={resetIdleTimer}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {(isOpen || isClosing) && (
        <div
          ref={menuRef}
          className={`floating-menu ${isClosing ? 'closing' : ''}`}
          style={menuStyle}
          role="menu"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.route ||
              (item.route !== '/' && location.pathname.startsWith(item.route + '/'));

            return (
              <button
                key={item.id}
                role="menuitem"
                className={`floating-menu-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.route)}
              >
                <div className="menu-icon">
                  <Icon size={18} />
                </div>
                <span className="menu-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
