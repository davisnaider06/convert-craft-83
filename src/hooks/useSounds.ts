import { useCallback, useRef, useState, useEffect } from "react";

// Sons premium minimalistas e futuristas
const SOUNDS = {
  // Transição suave - whoosh sutil
  transition: "https://cdn.freesound.org/previews/456/456547_9159316-lq.mp3",
  // Confirmação - tap digital leve
  confirm: "https://cdn.freesound.org/previews/521/521974_1648170-lq.mp3",
  // Conclusão - chime sutil de sucesso
  success: "https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3",
};

type SoundType = keyof typeof SOUNDS;

export function useSounds() {
  // DESATIVADO por padrão para acessibilidade
  const [enabled, setEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("boder_sound_enabled");
      return saved === "true"; // Só ativa se explicitamente true
    }
    return false;
  });

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    localStorage.setItem("boder_sound_enabled", String(enabled));
  }, [enabled]);

  const preloadSounds = useCallback(() => {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      if (!audioRefs.current[key]) {
        const audio = new Audio(url);
        audio.volume = 0.12; // Volume baixo
        audio.preload = "auto";
        audioRefs.current[key] = audio;
      }
    });
  }, []);

  useEffect(() => {
    preloadSounds();
  }, [preloadSounds]);

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return;
      
      const audio = audioRefs.current[type];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignora erros de autoplay
        });
      }
    },
    [enabled]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return { play, enabled, toggle };
}
