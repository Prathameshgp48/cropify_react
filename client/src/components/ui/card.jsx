// src/components/ui/card.jsx
import React from 'react';
import { cn } from '../utils';

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('bg-white rounded-xl p-6 shadow-sm border', className)}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-4', className)} {...props} />
);
