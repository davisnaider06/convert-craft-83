import React from 'react';

interface CallToActionProps {
  content: {
    title: string;
    subtitle?: string;
    button_text: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const CallToActionSection: React.FC<CallToActionProps> = ({ content, primaryColor, isMobile }) => {
  return (
    <section className="py-24 text-center px-4" style={{ backgroundColor: primaryColor }}>
      <div className="container mx-auto max-w-3xl text-white">
        <h2 className={`font-bold mb-6 ${isMobile ? "text-3xl" : "text-4xl md:text-5xl"}`}>
          {content.title}
        </h2>
        {content.subtitle && <p className="text-xl opacity-90 mb-10">{content.subtitle}</p>}
        <button className="bg-white text-slate-900 h-16 px-10 text-xl rounded-full font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto">
          {content.button_text}
        </button>
      </div>
    </section>
  );
};

export default CallToActionSection;