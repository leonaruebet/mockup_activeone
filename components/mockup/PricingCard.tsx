import React from 'react';
import { cn } from '../../../../shared/ui/utils';
import { Check } from 'lucide-react';

interface PricingCardProps {
    name: string;
    price: number;
    credits: number;
    bonusCredits?: number;
    pricePerCredit: number;
    features: string[];
    popular?: boolean;
    highlight?: string;
}

export const PricingCard: React.FC<PricingCardProps> = ({
    name,
    price,
    credits,
    bonusCredits = 0,
    pricePerCredit,
    features,
    popular = false,
    highlight,
}) => {
    return (
        <div className={cn(
            "relative rounded-2xl p-6 flex flex-col h-full border-2 transition-all duration-300",
            popular
                ? "border-brand-red bg-white shadow-xl scale-105 z-10"
                : "border-gray-100 bg-gray-50 hover:border-brand-blue/30"
        )}>
            {popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-red text-white px-4 py-1 rounded-full text-sm font-bold shadow-md whitespace-nowrap">
                    {highlight || "Most Popular"}
                </div>
            )}

            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-brand-navy mb-2">{name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-brand-navy">฿{price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">฿{pricePerCredit.toFixed(2)} / coin</p>
            </div>

            <div className="mb-6 bg-brand-navy/5 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold text-brand-blue">
                    {credits} <span className="text-lg text-brand-navy">Coins</span>
                </div>
                {bonusCredits > 0 && (
                    <div className="text-sm font-semibold text-brand-red mt-1">
                        + {bonusCredits} Bonus Coins
                    </div>
                )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-gray-600">
                        <Check className="w-5 h-5 text-brand-green shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button className={cn(
                "w-full py-3 rounded-xl font-bold transition-all duration-300",
                popular
                    ? "bg-brand-red text-white hover:bg-red-600 shadow-lg hover:shadow-red-200"
                    : "bg-white text-brand-navy border-2 border-brand-navy hover:bg-brand-navy hover:text-white"
            )}>
                Choose Plan
            </button>
        </div>
    );
};
