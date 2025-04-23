// src/components/ui/button.jsx
import React from 'react';
import { cn } from '../utils';

export const Button = ({ className, children, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
