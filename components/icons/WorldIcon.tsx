import React from 'react';

// Fixed: Added className prop to support custom styling and resolve type error in StoreCard.tsx
export const WorldIcon: React.FC<{className?: string}> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75a9.023 9.023 0 0016.5 0m-16.5-7.5a9.023 9.023 0 0116.5 0" />
    </svg>
);