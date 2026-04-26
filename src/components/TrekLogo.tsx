import React from 'react';

export default function TrekLogo({ className = "w-6 h-6 text-white" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className}>
      <path d="M 50 15 L 25 50 L 35 50 L 50 30 L 65 50 L 80 50 Z" />
      <path d="M 20 60 C 20 60, 40 80, 60 60 L 60 70 L 80 50 L 60 30 L 60 40 C 40 60, 20 60, 20 60 Z" />
    </svg>
  );
}
