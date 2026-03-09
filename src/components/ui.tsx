import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <div className={cn("glass-panel rounded-xl p-6 relative overflow-hidden", className)}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
            {children}
        </div>
    );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{title}</h2>
            {subtitle && <p className="text-zinc-400 text-sm">{subtitle}</p>}
        </div>
    );
}
