export interface QuizAlternativa {
  id: string;
  texto: string;
}

export interface QuizQuestao {
  id: string;
  pergunta: string;
  explicacao: string;
  alternativas: QuizAlternativa[];
}

export interface Quiz {
  id: string;
  titulo: string;
  questoes: QuizQuestao[];
}