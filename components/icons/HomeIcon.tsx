import React from 'react';

export const HomeIcon: React.FC<{className?: string}> = ({className="w-6 h-6"}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a.75.75 0 011.06 0l8.955 8.955a.75.75 0 01-1.06 1.06l-1.72-1.72V19.5a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V11.34l-1.72 1.72a.75.75 0 01-1.06-1.06z" />
    </svg>
);