import React from 'react';
import { cn } from '@/plane/utils';

interface PlankCatIconProps {
  size?: number;
  className?: string;
}

/**
 * PlankCatIcon
 * 
 * A clean, minimalist cat icon representing the Plank brand.
 * Uses `currentColor` so Tailwind color utilities control the fill.
 * 
 * @example
 * <PlankCatIcon size={32} className="text-blue-600" />
 * <PlankCatIcon className="text-white hover:text-opacity-75" />
 */
const PlankCatIcon = React.forwardRef<SVGSVGElement, PlankCatIconProps>(
  ({ size = 24, className }, ref) => {
    return (
      <svg
        ref={ref}
        viewBox="0 0 24 24"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        className={cn('inline-block', className)}
      >
        {/* Cat head */}
        <rect x="5" y="8" width="14" height="10" rx="1" />
        
        {/* Left ear */}
        <polygon points="7,8 5,4 9,6" />
        
        {/* Right ear */}
        <polygon points="17,8 19,4 15,6" />
        
        {/* Left eye */}
        <rect x="8" y="10" width="2" height="2" />
        
        {/* Right eye */}
        <rect x="14" y="10" width="2" height="2" />
        
        {/* Nose */}
        <polygon points="12,13 11,14 13,14" />
        
        {/* Left whiskers */}
        <line
          x1="5"
          y1="12"
          x2="2"
          y2="11"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="14"
          x2="2"
          y2="14"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="5"
          y1="16"
          x2="2"
          y2="17"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        
        {/* Right whiskers */}
        <line
          x1="19"
          y1="12"
          x2="22"
          y2="11"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="19"
          y1="14"
          x2="22"
          y2="14"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <line
          x1="19"
          y1="16"
          x2="22"
          y2="17"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }
);

PlankCatIcon.displayName = 'PlankCatIcon';

export default PlankCatIcon;
