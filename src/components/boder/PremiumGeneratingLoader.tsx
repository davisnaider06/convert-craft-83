import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Check,
  Code2,
  Wand2
} from "lucide-react";
import boderLogo from "@/assets/boder-logo.png";

interface GeneratingStep {
  id: string;
  label: string;
  icon: React.ElementType;
  duration: number;
}

const GENERATING_STEPS: GeneratingStep[] = [
  { id: "template", label: "Aplicando template", icon: Layout, duration: 3000 },
  { id: "copy", label: "Gerando copy persuasivo", icon: Type, duration: 4000 },
  { id: "design", label: "Refinando design", icon: Palette, duration: 3500 },
  { id: "optimization", label: "Otimizando conversão", icon: Zap, duration: 3000 },
  { id: "code", label: "Gerando código", icon: Code2, duration: 4000 },
  { id: "magic", label: "Aplicando magia IA", icon: Wand2, duration: 2500 },
];

interface PremiumGeneratingLoaderProps {
  templateName?: string;
}

export function PremiumGeneratingLoader({ templateName }: PremiumGeneratingLoaderProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = GENERATING_STEPS[currentStepIndex]?.duration || 3000;
    
    // Progress animation within step
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const target = ((currentStepIndex + 1) / GENERATING_STEPS.length) * 100;
        const current = (currentStepIndex / GENERATING_STEPS.length) * 100;
        const diff = target - current;
        const newProgress = Math.min(prev + (diff / (stepDuration / 100)), target);
        return newProgress;
      });
    }, 100);

    // Move to next step
    const stepTimer = setTimeout(() => {
      if (currentStepIndex < GENERATING_STEPS.length - 1) {
        setCompletedSteps(prev => [...prev, GENERATING_STEPS[currentStepIndex].id]);
        setCurrentStepIndex(prev => prev + 1);
      }
    }, stepDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimer);
    };
  }, [currentStepIndex]);

  const currentStep = GENERATING_STEPS[currentStepIndex];

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      {/* Central orb with logo */}
      <div className="relative mb-12">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-primary/20"
              style={{
                width: `${180 + i * 60}px`,
                height: `${180 + i * 60}px`,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: i % 2 === 0 ? 360 : -360,
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>

        {/* Orbiting particles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                boxShadow: "0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.5)",
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <motion.div
                className="absolute"
                style={{
                  left: `${70 + i * 10}px`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Central container */}
        <motion.div
          className="relative w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm"
          animate={{
            boxShadow: [
              "0 0 30px hsl(var(--primary) / 0.2)",
              "0 0 60px hsl(var(--primary) / 0.4)",
              "0 0 30px hsl(var(--primary) / 0.2)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Spinning border */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent, hsl(var(--primary)), transparent)`,
              maskImage: "radial-gradient(transparent 60%, black 61%)",
              WebkitMaskImage: "radial-gradient(transparent 60%, black 61%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={boderLogo}
              alt="Boder AI"
              className="h-20 w-auto filter drop-shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
            />
          </motion.div>
        </motion.div>

        {/* Floating current step icon */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={currentStep?.id}
        >
          <motion.div
            className="flex items-center justify-center w-10 h-10 rounded-full bg-card border-2 border-primary shadow-lg shadow-primary/20"
            animate={{ 
              y: [0, -3, 0],
              boxShadow: [
                "0 0 10px hsl(var(--primary) / 0.3)",
                "0 0 20px hsl(var(--primary) / 0.5)",
                "0 0 10px hsl(var(--primary) / 0.3)",
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {currentStep && <currentStep.icon className="h-5 w-5 text-primary" />}
          </motion.div>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h2
        className="text-2xl md:text-3xl font-bold mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Criando seu site...
      </motion.h2>
      
      {templateName && (
        <motion.p
          className="text-muted-foreground mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Template: <span className="text-foreground font-medium">{templateName}</span>
        </motion.p>
      )}

      {/* Progress bar */}
      <div className="relative mb-8">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/70"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <motion.div
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ width: "30%" }}
          animate={{ left: ["0%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mt-2 text-sm text-muted-foreground">
          {Math.round(progress)}% concluído
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {GENERATING_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStepIndex === index;
            const isPending = index > currentStepIndex;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isPending ? 0.4 : 1, 
                  x: 0,
                }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isCurrent 
                    ? "bg-primary/10 border border-primary/30" 
                    : isCompleted 
                      ? "bg-muted/50" 
                      : "bg-transparent"
                }`}
              >
                {/* Step indicator */}
                <div className="relative flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </motion.div>
                  ) : isCurrent ? (
                    <motion.div
                      className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center"
                      animate={{ 
                        borderColor: ["hsl(var(--primary))", "hsl(var(--primary) / 0.5)", "hsl(var(--primary))"],
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <step.icon className="h-4 w-4 text-primary" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <step.icon className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                {/* Step label */}
                <span className={`text-sm font-medium ${
                  isCurrent 
                    ? "text-foreground" 
                    : isCompleted 
                      ? "text-muted-foreground" 
                      : "text-muted-foreground/50"
                }`}>
                  {step.label}
                </span>

                {/* Animated dots for current step */}
                {isCurrent && (
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ 
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ 
                          duration: 0.8, 
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom tip */}
      <motion.p
        className="mt-8 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Sparkles className="inline h-3 w-3 mr-1" />
        A IA está trabalhando para criar a melhor versão do seu site
      </motion.p>
    </div>
  );
}
