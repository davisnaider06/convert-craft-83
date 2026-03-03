import React from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    visual_variant?: string;
  };
  primaryColor: string;
  isMobile: boolean;
}

export const PricingTable: React.FC<PricingTableProps> = ({ content, primaryColor, isMobile }) => {
  if (!content.plans || content.plans.length === 0) return null;

  const variant = String(content.visual_variant || "").toLowerCase();
  const premium = variant === "premium";
  const event = variant === "event";
  const sectionBg = premium ? "bg-slate-950" : event ? "bg-indigo-50" : "bg-slate-50";
  const titleColor = premium ? "text-amber-50" : "text-slate-900";

  return (
    <section className={`py-24 ${sectionBg}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-14 ${titleColor}`}>
          {content.title || "Planos e Precos"}
        </h2>
        <div className={`grid gap-6 items-stretch ${isMobile ? "grid-cols-1" : "md:grid-cols-3"}`}>
          {content.plans.map((plan, i) => (
            <Card
              key={i}
              className={`relative rounded-2xl ${
                premium ? "bg-slate-900 border-slate-700" : "bg-white"
              } ${plan.recommended ? "ring-2" : ""}`}
              style={{ ringColor: plan.recommended ? primaryColor : undefined }}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" style={{ backgroundColor: primaryColor }}>
                  Mais Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className={premium ? "text-slate-100" : "text-slate-900"}>{plan.name}</CardTitle>
                <div className={`text-4xl font-black ${premium ? "text-slate-50" : "text-slate-900"}`}>
                  {plan.price}
                  <span className="text-sm font-normal text-slate-400">/mes</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 min-h-[132px]">
                  {plan.features.map((feat, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${premium ? "text-slate-300" : "text-slate-600"}`}>
                      <Check className="h-4 w-4 mt-0.5" style={{ color: primaryColor }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.recommended ? "default" : premium ? "secondary" : "outline"}
                  style={plan.recommended ? { backgroundColor: primaryColor, color: "#fff" } : undefined}
                >
                  {plan.cta || "Escolher plano"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
