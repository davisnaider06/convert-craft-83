import { toast as sonnerToast } from "sonner";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface PremiumToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const gradients = {
  success: "from-primary/60 via-primary/30 to-transparent",
  error: "from-destructive/60 via-destructive/30 to-transparent",
  warning: "from-yellow-500/60 via-yellow-500/30 to-transparent",
  info: "from-blue-500/60 via-blue-500/30 to-transparent",
};

const iconColors = {
  success: "text-primary",
  error: "text-destructive",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

const glowColors = {
  success: "shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
  error: "shadow-[0_0_30px_hsl(var(--destructive)/0.3)]",
  warning: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
  info: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
};

export function premiumToast({ 
  title, 
  description, 
  type = "success", 
  duration = 4000 
}: PremiumToastOptions) {
  const Icon = icons[type];

  return sonnerToast.custom(
    (t) => (
      <div 
        className={`
          relative rounded-2xl p-[1px] 
          bg-gradient-to-b ${gradients[type]}
          ${glowColors[type]}
          animate-in slide-in-from-top-2 fade-in duration-300
        `}
      >
        <div className="relative rounded-2xl bg-card/95 backdrop-blur-xl overflow-hidden">
          {/* Animated background effect */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className={`
                absolute -top-1/2 -left-1/2 w-full h-full 
                bg-gradient-to-br ${gradients[type].replace('/60', '/40').replace('/30', '/20')}
                animate-[spin_8s_linear_infinite]
              `}
            />
          </div>
          
          {/* Dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '16px 16px',
            }}
          />
          
          {/* Content */}
          <div className="relative flex items-start gap-3 p-4">
            <div className={`
              relative flex-shrink-0 p-2 rounded-full 
              bg-gradient-to-br ${gradients[type].replace('/60', '/20').replace('/30', '/10')}
            `}>
              <Icon className={`h-5 w-5 ${iconColors[type]} animate-pulse`} />
              
              {/* Icon glow ring */}
              <div className={`
                absolute inset-0 rounded-full 
                bg-gradient-to-br ${gradients[type]}
                opacity-50 blur-sm -z-10
              `} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm leading-tight">
                {title}
              </p>
              {description && (
                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            {/* Close button */}
            <button 
              onClick={() => sonnerToast.dismiss(t)}
              className="
                flex-shrink-0 p-1 rounded-full 
                text-muted-foreground/60 hover:text-foreground
                hover:bg-foreground/10 transition-colors
              "
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
          
          {/* Bottom shine effect */}
          <div className={`
            absolute bottom-0 left-0 right-0 h-px
            bg-gradient-to-r from-transparent ${gradients[type].replace('to-transparent', 'to-transparent')} via-current
            opacity-30
          `} />
        </div>
      </div>
    ),
    { duration }
  );
}

// Convenience methods
premiumToast.success = (title: string, description?: string) => 
  premiumToast({ title, description, type: "success" });

premiumToast.error = (title: string, description?: string) => 
  premiumToast({ title, description, type: "error" });

premiumToast.warning = (title: string, description?: string) => 
  premiumToast({ title, description, type: "warning" });

premiumToast.info = (title: string, description?: string) => 
  premiumToast({ title, description, type: "info" });