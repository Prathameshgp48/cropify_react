// src/components/ui/badge.jsx
import React from 'react';
import { cn } from '../utils';

export const Badge = ({ variant = 'default', className, children }) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium';
  const variants = {
    default: 'bg-gray-200 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={cn(base, variants[variant], className)}>
      {children}
    </span>
  );
};
