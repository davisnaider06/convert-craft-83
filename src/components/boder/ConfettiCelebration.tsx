import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  rotation: number;
  shape: "square" | "circle" | "star";
}

interface ConfettiCelebrationProps {
  isActive: boolean;
  onComplete?: () => void;
}

const COLORS = [
  "hsl(var(--primary))",
  "#FFD700", // Gold
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#A855F7", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#10B981", // Emerald
];

export function ConfettiCelebration({ isActive, onComplete }: ConfettiCelebrationProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 80; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          size: 8 + Math.random() * 12,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * 360,
          shape: ["square", "circle", "star"][Math.floor(Math.random() * 3)] as "square" | "circle" | "star",
        });
      }
      setPieces(newPieces);

      // Clear after animation
      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  const renderShape = (piece: ConfettiPiece) => {
    if (piece.shape === "circle") {
      return (
        <div
          className="rounded-full"
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
          }}
        />
      );
    }
    if (piece.shape === "star") {
      return (
        <svg
          width={piece.size}
          height={piece.size}
          viewBox="0 0 24 24"
          fill={piece.color}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return (
      <div
        className="rounded-sm"
        style={{
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color,
        }}
      />
    );
  };

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{ left: `${piece.x}%`, top: -30 }}
              initial={{ 
                y: -30, 
                rotate: 0, 
                opacity: 1,
                scale: 0
              }}
              animate={{
                y: window.innerHeight + 50,
                rotate: piece.rotation + 720,
                opacity: [1, 1, 1, 0],
                scale: [0, 1.2, 1, 0.8],
                x: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 100],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.23, 0.61, 0.35, 0.9],
              }}
            >
              {renderShape(piece)}
            </motion.div>
          ))}

          {/* Central burst effect */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 2, 3],
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-32 h-32 rounded-full bg-primary/30 blur-xl" />
          </motion.div>

          {/* Sparkle rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/40"
              initial={{ width: 0, height: 0, opacity: 0 }}
              animate={{ 
                width: ring * 150,
                height: ring * 150,
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 1.2, 
                delay: ring * 0.15,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
