import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  content: {
    title?: string;
    items: FAQItem[];
  };
  primaryColor: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ content, primaryColor }) => {
  if (!content.items || content.items.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">{content.title || "Perguntas Frequentes"}</h2>
        <div className="space-y-4">
          {content.items.map((item, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
              <h4 className="text-lg font-bold text-slate-900 mb-2">{item.question}</h4>
              <p className="text-slate-600 leading-relaxed text-sm">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};