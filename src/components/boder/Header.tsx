import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";
import boderLogo from "@/assets/boder-logo.png";

interface HeaderProps {
  credits: number;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export function Header({ credits, soundEnabled, onSoundToggle }: HeaderProps) {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <img 
            src={boderLogo} 
            alt="Boder AI" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold">Boder AI</span>
        </motion.div>

        <div className="flex items-center gap-3">
          <motion.div 
            className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm"
            whileHover={{ scale: 1.02 }}
          >
            <span className="text-muted-foreground">Créditos:</span>
            <span className="font-semibold text-foreground">{credits}/5</span>
          </motion.div>
          <SoundToggle enabled={soundEnabled} onToggle={onSoundToggle} />
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  );
}
