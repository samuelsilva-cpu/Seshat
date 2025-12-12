import React from 'react';
import { cn } from '@/plane/utils';
import PlankCatIcon from './PlankCatIcon';

interface PlankLogoProps {
  compact?: boolean;
  size?: number;
  className?: string;
}

/**
 * PlankLogo
 * 
 * A responsive logo component that displays:
 * - Icon only when `compact={true}` (sidebar collapsed)
 * - Icon + text when `compact={false}` (sidebar expanded)
 * 
 * Uses `currentColor` for color control via Tailwind classes.
 * 
 * @example
 * <PlankLogo compact={true} size={32} />
 * <PlankLogo compact={false} className="text-slate-900 dark:text-white" />
 */
const PlankLogo = React.forwardRef<HTMLDivElement, PlankLogoProps>(
  ({ compact = false, size = 24, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 transition-opacity duration-200',
          className
        )}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          <PlankCatIcon size={size} className="text-current" />
        </div>

        {/* Text - Only show when not compact */}
        {!compact && (
          <div className="flex-shrink-0 font-semibold text-current tracking-wide">
            <svg
              viewBox="0 0 120 24"
              width="120"
              height={size}
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="h-[1.2em] w-auto"
            >
              {/* P */}
              <path
                d="M 6 2 L 6 22 M 6 2 L 18 2 Q 24 2 24 8 Q 24 14 18 14 L 6 14"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* L */}
              <path
                d="M 32 2 L 32 22 L 32 22 L 45 22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* A */}
              <path
                d="M 57 22 L 64 2 L 71 22 M 60 12 L 68 12"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* N */}
              <path
                d="M 79 22 L 79 2 L 96 22 L 96 2"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* K */}
              <path
                d="M 104 2 L 104 22 M 104 12 L 120 2 M 104 12 L 120 22"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

PlankLogo.displayName = 'PlankLogo';

export default PlankLogo;
