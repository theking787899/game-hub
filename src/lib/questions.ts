import type { QuizData } from "@/lib/types";

const bank: QuizData[] = [
  { question: "Qual é a capital do Brasil?", options: ["Rio de Janeiro", "Brasília", "São Paulo", "Salvador"], correctAnswer: "Brasília" },
  { question: "Quantos planetas tem o Sistema Solar?", options: ["7", "8", "9", "10"], correctAnswer: "8" },
  { question: "Qual é o maior oceano do mundo?", options: ["Atlântico", "Índico", "Pacífico", "Ártico"], correctAnswer: "Pacífico" },
  { question: "Em que ano o Brasil ganhou a Copa do Mundo pela quinta vez?", options: ["1994", "1998", "2002", "2006"], correctAnswer: "2002" },
  { question: "Quem pintou a Mona Lisa?", options: ["Michelangelo", "Leonardo da Vinci", "Rafael", "Van Gogh"], correctAnswer: "Leonardo da Vinci" },
  { question: "Qual elemento químico tem o símbolo O?", options: ["Ouro", "Ósmio", "Oxigênio", "Ozônio"], correctAnswer: "Oxigênio" },
  { question: "Qual é o maior animal terrestre?", options: ["Girafa", "Elefante-africano", "Rinoceronte", "Hipopótamo"], correctAnswer: "Elefante-africano" },
  { question: "Quantos jogadores de cada time ficam em campo numa partida de futebol?", options: ["9", "10", "11", "12"], correctAnswer: "11" },
  { question: "Quanto é 7 × 8?", options: ["54", "56", "58", "64"], correctAnswer: "56" },
  { question: "Qual país tem o formato de uma bota no mapa?", options: ["Grécia", "Portugal", "Itália", "Espanha"], correctAnswer: "Itália" },
  { question: "Quantos lados tem um hexágono?", options: ["5", "6", "7", "8"], correctAnswer: "6" },
  { question: "Qual é o menor país do mundo?", options: ["Mônaco", "San Marino", "Malta", "Vaticano"], correctAnswer: "Vaticano" },
];

// Sorteia n perguntas do banco.
export function pickQuestions(n = 8): QuizData[] {
  const copy = [...bank];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
