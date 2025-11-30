import React from 'react';
import { cn } from '../../../../shared/ui/utils';

interface SectionProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
    title?: string;
    subtitle?: string;
    dark?: boolean;
}

export const Section: React.FC<SectionProps> = ({
    children,
    className,
    id,
    title,
    subtitle,
    dark = false,
}) => {
    return (
        <section
            id={id}
            className={cn(
                'py-16 md:py-24 px-4 md:px-8',
                dark ? 'bg-brand-navy text-white' : 'bg-white text-brand-navy',
                className
            )}
        >
            <div className="max-w-7xl mx-auto">
                {(title || subtitle) && (
                    <div className="mb-12 text-center">
                        {title && (
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
                        )}
                        {subtitle && (
                            <p className={cn("text-lg md:text-xl max-w-2xl mx-auto", dark ? "text-gray-300" : "text-gray-600")}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </div>
        </section>
    );
};
