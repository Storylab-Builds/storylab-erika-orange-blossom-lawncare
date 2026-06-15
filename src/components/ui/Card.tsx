import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingStyles: Record<string, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-xl shadow-card border border-gray-100',
          paddingStyles[padding],
          hover && 'transition-shadow duration-200 hover:shadow-lg cursor-pointer',
        ),
        className,
      )}
    >
      {children}
    </div>
  );
}
