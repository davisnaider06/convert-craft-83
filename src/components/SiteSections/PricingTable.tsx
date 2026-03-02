import React from 'react';
import { Check } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
  cta?: string;
}

interface PricingTableProps {
  content: {
    title?: string;
    plans: Plan[];
  };
  primaryColor: string;
  isMobile: boolean;
}

export const PricingTable: React.FC<PricingTableProps> = ({ content, primaryColor, isMobile }) => {
  if (!content.plans || content.plans.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-slate-900">
          {content.title || "Planos e Preços"}
        </h2>
        <div className={`grid gap-8 items-stretch ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {content.plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-8 rounded-3xl bg-white border flex flex-col shadow-sm transition-all duration-300 hover:shadow-xl ${plan.recommended ? 'scale-105 z-10' : ''}`}
              style={{ borderColor: plan.recommended ? primaryColor : '#e2e8f0', borderWidth: plan.recommended ? '2px' : '1px' }}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-widest" style={{ backgroundColor: primaryColor }}>
                  Mais Popular
                </div>
              )}
              <h3 className="text-xl font-bold mb-2 text-slate-900">{plan.name}</h3>
              <div className="text-4xl font-black mb-6 text-slate-900">
                {plan.price}<span className="text-sm font-normal text-slate-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check className="h-5 w-5 flex-shrink-0" style={{ color: primaryColor }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button 
                className="w-full py-4 rounded-2xl font-bold transition-all active:scale-95"
                style={{ 
                  backgroundColor: plan.recommended ? primaryColor : '#f1f5f9', 
                  color: plan.recommended ? '#fff' : '#0f172a' 
                }}
              >
                {plan.cta || "Escolher plano"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};