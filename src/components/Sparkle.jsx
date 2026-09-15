export default function Sparkle({ className = '', style = {} }) {
  return (
    <svg 
      className={`sparkle-icon ${className}`} 
      style={{
        width: '1em',
        height: '1em',
        display: 'inline-block',
        verticalAlign: 'middle',
        fill: 'currentColor',
        ...style
      }} 
      viewBox="0 0 24 24"
    >
      <path d="M12 0C12 6.627 17.373 12 24 12C17.373 12 12 17.373 12 24C12 17.373 6.627 12 0 12C6.627 12 12 6.627 12 0Z" />
    </svg>
  );
}
