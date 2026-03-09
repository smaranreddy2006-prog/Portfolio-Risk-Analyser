import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function InfoTooltip({ text }: { text: string }) {
    return (
        <div className="group relative inline-flex items-center justify-center cursor-help">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 hover:text-indigo-400 transition-colors"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-800 text-xs text-zinc-300 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-center shadow-xl border border-zinc-700 pointer-events-none">
                {text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-800"></div>
            </div>
        </div>
    );
}

export const Button = ({ children, onClick, disabled, className = '', variant = 'primary' }: { children: ReactNode; onClick?: () => void; disabled?: boolean; className?: string; variant?: 'primary' | 'secondary' }) => {
    const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 relative overflow-hidden group";

    const variants = {
        primary: "bg-indigo-600/80 backdrop-blur-md text-white hover:bg-indigo-500/90 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-500/50",
        secondary: "bg-white/5 backdrop-blur-md text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
};

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-2xl p-4 sm:p-6 ${className}`}>
        {children}
    </div>
);

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">{title}</h2>
            {subtitle && <p className="text-zinc-400 text-xs sm:text-sm">{subtitle}</p>}
        </div>
    );
}
