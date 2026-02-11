import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  delay?: number;
  variant?: "default" | "success" | "warning" | "danger";
}

export function AdminMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  delay = 0,
  variant = "default",
}: AdminMetricCardProps) {
  const variantStyles = {
    default: "from-primary/10 to-primary/5 border-primary/20",
    success: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
    warning: "from-amber-500/10 to-amber-500/5 border-amber-500/20",
    danger: "from-red-500/10 to-red-500/5 border-red-500/20",
  };

  const iconStyles = {
    default: "text-primary bg-primary/20",
    success: "text-emerald-400 bg-emerald-500/20",
    warning: "text-amber-400 bg-amber-500/20",
    danger: "text-red-400 bg-red-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-xl",
        variantStyles[variant]
      )}
    >
      {/* Glow effect */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-emerald-400" : "text-red-400"
            )}>
              <span>{trend.positive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
