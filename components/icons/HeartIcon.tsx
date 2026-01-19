import React from 'react';

interface HeartIconProps {
  className?: string;
  filled?: boolean;
}

export const HeartIcon: React.FC<HeartIconProps> = ({ className = 'w-6 h-6', filled = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill={filled ? 'currentColor' : 'none'}
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
    />
  </svg>
);
