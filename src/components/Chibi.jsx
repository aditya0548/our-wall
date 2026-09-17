import React from 'react';
import '../styles/chibi.css';

const THEME_COLORS = {
  sakura: '#D98BA8',
  ocean: '#4A7BB8',
  matcha: '#7FA85A',
  midnight: '#9A8AD8'
};

const renderEyes = (reaction) => {
    switch (reaction) {
        case 'sleepy':
            return (
                <g className="chibi-eyes sleepy">
                    <path d="M 18 35 Q 22 38 26 35" fill="none" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />
                    <path d="M 34 35 Q 38 38 42 35" fill="none" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'love':
            return (
                <g className="chibi-eyes love">
                    <path d="M 22 33 A 3 3 0 0 0 16 33 Q 16 37 22 40 Q 28 37 28 33 A 3 3 0 0 0 22 33 Z" fill="#D98BA8" />
                    <path d="M 38 33 A 3 3 0 0 0 32 33 Q 32 37 38 40 Q 44 37 44 33 A 3 3 0 0 0 38 33 Z" fill="#D98BA8" />
                </g>
            );
        case 'grumpy':
            return (
                <g className="chibi-eyes grumpy">
                    <circle cx="22" cy="35" r="3" fill="#3D3A36" />
                    <path d="M 18 32 L 26 34" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="38" cy="35" r="3" fill="#3D3A36" />
                    <path d="M 42 32 L 34 34" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />
                </g>
            );
        case 'blush':
            return (
                <g className="chibi-eyes blush">
                    <circle cx="20" cy="35" r="3" fill="#3D3A36" />
                    <circle cx="19" cy="35" r="1" fill="#FFF" />
                    <circle cx="36" cy="35" r="3" fill="#3D3A36" />
                    <circle cx="35" cy="35" r="1" fill="#FFF" />
                </g>
            );
        case 'wave':
        case 'idle':
        default:
            return (
                <g className="chibi-eyes idle">
                    <circle cx="22" cy="35" r="3" fill="#3D3A36" />
                    <circle cx="23" cy="34" r="1" fill="#FFF" />
                    <circle cx="38" cy="35" r="3" fill="#3D3A36" />
                    <circle cx="39" cy="34" r="1" fill="#FFF" />
                </g>
            );
    }
};

const renderMouth = (reaction) => {
    switch (reaction) {
        case 'sleepy':
            return <circle cx="30" cy="42" r="2" fill="#3D3A36" />;
        case 'love':
            return <path d="M 26 41 Q 30 46 34 41" fill="none" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />;
        case 'grumpy':
            return <path d="M 28 43 Q 30 41 32 43" fill="none" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />;
        case 'wave':
        case 'idle':
        case 'blush':
        default:
            return <path d="M 28 41 Q 30 44 32 41" fill="none" stroke="#3D3A36" strokeWidth="2" strokeLinecap="round" />;
    }
};

const renderHands = (reaction) => {
    switch (reaction) {
        case 'wave':
            return (
                <g className="chibi-hands wave">
                    <circle cx="16" cy="52" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                    <g className="hand-wave-anim" style={{ transformOrigin: '44px 25px' }}>
                        <circle cx="44" cy="25" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                    </g>
                </g>
            );
        case 'love':
            return (
                <g className="chibi-hands love">
                    <circle cx="18" cy="40" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                    <circle cx="42" cy="40" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                </g>
            );
        case 'blush':
            return (
                <g className="chibi-hands blush">
                    <circle cx="16" cy="52" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                    <circle cx="40" cy="42" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                </g>
            );
        case 'grumpy':
            return (
                <g className="chibi-hands grumpy">
                    <circle cx="12" cy="44" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                    <circle cx="48" cy="52" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                </g>
            );
        case 'sleepy':
        case 'idle':
        default:
            return (
                <g className="chibi-hands idle">
                    <circle cx="16" cy="52" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                    <circle cx="44" cy="52" r="4" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                </g>
            );
    }
};

const renderParticles = (reaction) => {
    switch (reaction) {
        case 'love':
            return (
                <g className="chibi-particles love-particles">
                    <path d="M 12 15 A 2 2 0 0 0 8 15 Q 8 18 12 21 Q 16 18 16 15 A 2 2 0 0 0 12 15 Z" fill="#D98BA8" className="particle heart-1" />
                    <path d="M 48 10 A 2 2 0 0 0 44 10 Q 44 13 48 16 Q 52 13 52 10 A 2 2 0 0 0 48 10 Z" fill="#D98BA8" className="particle heart-2" />
                </g>
            );
        case 'sleepy':
            return (
                <g className="chibi-particles sleep-particles">
                    <text x="40" y="20" fontSize="10" fill="#3D3A36" className="particle zzz-1">Z</text>
                    <text x="48" y="10" fontSize="7" fill="#3D3A36" className="particle zzz-2">z</text>
                </g>
            );
        case 'grumpy':
            return (
                <g className="chibi-particles grumpy-particles">
                    <path d="M 45 20 Q 42 16 48 14 Q 52 12 49 18 Q 52 24 45 20" fill="#3D3A36" opacity="0.6" className="particle puff" />
                </g>
            );
        default:
            return null;
    }
};

export default function Chibi({ theme = 'sakura', reaction = 'idle', isMine, name, onClick }) {
    const hairColor = THEME_COLORS[theme] || THEME_COLORS.sakura;
    const blushOpacity = reaction === 'blush' ? 0.8 : 0.3;

    return (
        <div 
            className={`chibi-wrapper ${isMine ? 'chibi-mine' : 'chibi-partner'}`} 
            onClick={onClick}
        >
           <div className={`chibi-svg-container reaction-${reaction}`}>
               <svg viewBox="0 0 60 70" className="chibi-svg">
                   {/* Hair background blob */}
                   <path d="M 10 35 Q 10 10 30 10 Q 50 10 50 35 Q 50 45 45 45 Q 30 25 15 45 Q 10 45 10 35 Z" fill={hairColor} />
                   
                   {/* Hair tuft */}
                   <path d="M 30 10 Q 35 2 40 10 Q 30 15 30 10" fill={hairColor} />
                   <path d="M 20 15 Q 30 5 40 15 Q 30 25 20 15 Z" fill={hairColor} />

                   {/* Head */}
                   <circle cx="30" cy="35" r="22" fill="#FFE4D6" stroke="#3D3A36" strokeWidth="1.5" />
                   
                   {/* Front Hair bangs */}
                   <path d="M 10 30 Q 20 15 35 25 Q 30 15 45 22 Q 55 35 50 25 Q 40 10 30 10 Q 15 10 10 30 Z" fill={hairColor} />

                   {/* Blush */}
                   <circle cx="16" cy="40" r="5" fill="#FFB8C8" opacity={blushOpacity} className="chibi-blush" />
                   <circle cx="44" cy="40" r="5" fill="#FFB8C8" opacity={blushOpacity} className="chibi-blush" />
                   
                   {/* Eyes */}
                   {renderEyes(reaction)}
                   
                   {/* Mouth */}
                   {renderMouth(reaction)}
                   
                   {/* Hands */}
                   {renderHands(reaction)}
                   
                   {/* Particles */}
                   {renderParticles(reaction)}
               </svg>
           </div>
           {name && <div className="chibi-name">{name}</div>}
        </div>
    );
}
