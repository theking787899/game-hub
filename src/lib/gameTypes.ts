// Temas do quiz. O "value" é exatamente o que o servidor recebe em gameType.
export const gameTypes = [
  { value: "general", label: "Geral", description: "Um pouco de tudo." },
  { value: "animes", label: "Animes", description: "Personagens, histórias e clássicos." },
  { value: "movies", label: "Filmes", description: "Cinema de todas as épocas." },
  { value: "series", label: "Séries", description: "Séries de TV e streaming." },
] as const;

export type GameType = (typeof gameTypes)[number]["value"];

export const DEFAULT_GAME_TYPE: GameType = "general";