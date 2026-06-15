import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value: controlledValue,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  const [internal, setInternal] = useState(controlledValue ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternal(controlledValue);
    }
  }, [controlledValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setInternal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange?.(v);
    }, 300);
  };

  return (
    <div className={twMerge('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-gray-400 transition-colors hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
      />
    </div>
  );
}
