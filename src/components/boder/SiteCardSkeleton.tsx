import { motion } from "framer-motion";

export function SiteCardSkeleton() {
  return (
    <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-border/40 via-border/20 to-transparent">
      <div className="relative h-full rounded-3xl bg-card p-5 backdrop-blur-xl">
        {/* Header skeleton */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-full rounded-full bg-muted/60 animate-pulse" />
          </div>
          <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        </div>

        {/* Domain skeleton */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-4 w-4 rounded-full bg-muted animate-pulse" />
          <div className="h-4 w-40 rounded-full bg-muted/60 animate-pulse" />
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          <div className="h-6 w-16 rounded-full bg-muted/60 animate-pulse" />
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-9 rounded-full bg-muted animate-pulse" />
          <div className="h-9 w-9 rounded-full bg-muted/60 animate-pulse" />
          <div className="h-9 w-9 rounded-full bg-muted/40 animate-pulse" />
        </div>

        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
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
    </div>
  );
}

export function SiteCardSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <SiteCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}