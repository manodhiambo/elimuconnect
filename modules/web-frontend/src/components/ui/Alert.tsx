import React from 'react';
import { cn } from '../../lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(
        'relative w-full rounded-lg border p-4',
        {
          'bg-background text-foreground': variant === 'default',
          'border-destructive/50 text-destructive dark:border-destructive': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
);
AlertDescription.displayName = 'AlertDescription';
