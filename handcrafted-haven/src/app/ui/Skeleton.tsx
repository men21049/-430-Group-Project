// Skeleton.tsx
import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden bg-gray-300 rounded ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
    </div>
  );
};

export default Skeleton;
