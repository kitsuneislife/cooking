import { useEffect } from "react";
import { playMusic } from "../game/music";

// Põe a faixa para tocar enquanto a tela está aberta; a próxima tela troca com fade.
export function useMusic(track) {
  useEffect(() => {
    if (track) playMusic(track);
  }, [track]);
}
