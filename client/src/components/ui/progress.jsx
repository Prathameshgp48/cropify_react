// src/components/ui/progress.jsx
import React from 'react';
import { cn } from '../utils';

export const Progress = ({ value, className }) => {
  return (
    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={cn('h-full transition-all duration-300', className)}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
};
