import './Logo.css';

interface LogoProps {
  variant?: 'vertical' | 'square';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function Logo({ variant: _variant = 'vertical', size = 'medium', className = '' }: LogoProps) {
  const sizeClass = `logo-${size}`;
  
  return (
    <div className={`logo-container ${sizeClass} ${className}`}>
      <img 
        src="/logo.png" 
        alt="GymFu Logo" 
        className="logo-image"
      />
    </div>
  );
}
