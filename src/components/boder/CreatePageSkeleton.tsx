import { motion } from "framer-motion";

export function TemplateCardSkeleton() {
  return (
    <div className="relative rounded-2xl border-2 border-border overflow-hidden">
      {/* Preview skeleton */}
      <div className="h-36 w-full bg-muted animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 bg-card space-y-3">
        <div className="flex items-start justify-between">
          <div className="h-5 w-2/3 rounded-full bg-muted animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-muted/60 animate-pulse" />
          <div className="h-3 w-4/5 rounded-full bg-muted/40 animate-pulse" />
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
          <div className="h-5 w-12 rounded-full bg-muted/60 animate-pulse" />
        </div>
      </div>

      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
          animate={{ translateX: ["−100%", "100%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5,
          }}
        />
      </motion.div>
    </div>
  );
}

export function TemplateGridSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <div className="h-10 w-64 mx-auto rounded-full bg-muted animate-pulse mb-3" />
        <div className="h-5 w-80 mx-auto rounded-full bg-muted/60 animate-pulse" />
      </div>

      {/* Category filter skeleton */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="h-9 rounded-full bg-muted animate-pulse"
            style={{ width: `${60 + Math.random() * 40}px` }}
          />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <TemplateCardSkeleton />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function GeneratingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      {/* Central orb */}
      <div className="relative mb-8">
        <motion.div
          className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-primary/10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40" />
        </motion.div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
        </div>
      </div>

      {/* Text skeleton */}
      <div className="h-8 w-48 mx-auto rounded-full bg-muted animate-pulse mb-3" />
      <div className="h-5 w-64 mx-auto rounded-full bg-muted/60 animate-pulse mb-6" />

      {/* Progress skeleton */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 }}
          >
            <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
            <div 
              className="h-4 rounded-full bg-muted/60 animate-pulse"
              style={{ width: `${100 + Math.random() * 80}px` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}