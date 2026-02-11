import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  siteName: string;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  siteName,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={onClose}
          >
            <motion.div
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Gradient Border Container */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-destructive/60 via-destructive/30 to-transparent">
              <div className="relative rounded-3xl bg-card p-6 backdrop-blur-xl overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-destructive/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-destructive/10 blur-3xl" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="relative text-center">
                  {/* Icon */}
                  <motion.div
                    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20"
                    initial={{ rotate: -10, scale: 0.8 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    className="text-xl font-bold mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    Excluir site?
                  </motion.h2>

                  {/* Description */}
                  <motion.p
                    className="text-muted-foreground mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Você está prestes a excluir:
                  </motion.p>

                  {/* Site Name Badge */}
                  <motion.div
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <span className="font-semibold truncate max-w-[200px]">
                      {siteName}
                    </span>
                  </motion.div>

                  {/* Warning */}
                  <motion.div
                    className="mb-6 p-3 rounded-xl bg-destructive/5 border border-destructive/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-sm text-destructive">
                      ⚠️ Esta ação é <strong>irreversível</strong>. Todos os dados do site serão permanentemente excluídos.
                    </p>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={onClose}
                      disabled={isDeleting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 rounded-full gap-2"
                      onClick={onConfirm}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <motion.div
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {isDeleting ? "Excluindo..." : "Sim, excluir"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
