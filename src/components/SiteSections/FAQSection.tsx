import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  content: {
    title?: string;
    items: FAQItem[];
    visual_variant?: string;
  };
  primaryColor: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ content, primaryColor }) => {
  const items = Array.isArray(content?.items) ? content.items : [];
  if (items.length === 0) return null;

  const variant = String(content.visual_variant || "").toLowerCase();
  const dark = variant === "portfolio" || variant === "premium";
  const sectionBg = dark ? "bg-slate-950" : "bg-white";
  const cardClass = dark ? "bg-slate-900 border-slate-700" : "bg-white";
  const titleClass = dark ? "text-slate-50" : "text-slate-900";
  const textClass = dark ? "text-slate-300" : "text-slate-600";

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className={`rounded-2xl ${cardClass}`}>
          <CardHeader>
            <CardTitle className={`text-3xl font-bold text-center ${titleClass}`}>
              {content.title || "Perguntas Frequentes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className={dark ? "border-slate-700" : undefined}>
                  <AccordionTrigger className={titleClass}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className={textClass}>
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
