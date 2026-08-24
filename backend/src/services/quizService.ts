import { GoogleGenAI } from "@google/genai";
import { prisma } from "../config/prisma";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// ============================================================
// TIPOS
// ============================================================

interface QuizOptionIA {
  texto: string;
  correta: boolean;
}

interface QuizQuestionIA {
  pergunta: string;
  explicacao: string;
  alternativas: QuizOptionIA[];
}

interface QuizGeradoIA {
  titulo: string;
  questoes: QuizQuestionIA[];
}

// ============================================================
// GERAR QUIZ
// ============================================================

export async function gerarQuiz(videoId: string) {
  const video = await prisma.video.findUnique({
    where: {
      youtubeVideoId: videoId,
    },
    select: {
      id: true,
      youtubeVideoId: true,
      titulo: true,
      resumoIA: true,
    },
  });

  if (!video) {
    throw new Error("Vídeo não encontrado.");
  }

  // Verifica se o quiz já existe
  const quizExistente = await prisma.quiz.findUnique({
    where: {
      videoId: video.id,
    },
    include: {
      questoes: {
        orderBy: {
          ordem: "asc",
        },
        include: {
          alternativas: {
            orderBy: {
              ordem: "asc",
            },
          },
        },
      },
    },
  });

  if (quizExistente) {
    console.log(`Quiz encontrado no banco para o vídeo ${videoId}.`);

    return formatarQuizParaFrontend(quizExistente);
  }

  // O quiz depende do resumo
  if (!video.resumoIA) {
    throw new Error("O resumo do vídeo precisa ser gerado antes do quiz.");
  }

  console.log(`Gerando quiz para o vídeo ${videoId}...`);

  const quiz = await gerarComIA(video.titulo, video.resumoIA);

  // ==========================================================
  // SALVAMENTO
  // ==========================================================

  const quizSalvo = await prisma.$transaction(async (tx) => {
    const novoQuiz = await tx.quiz.create({
      data: {
        videoId: video.id,
        titulo: quiz.titulo,
        modeloIA: "gemini-3.5-flash-lite",
      },
    });

    for (let i = 0; i < quiz.questoes.length; i++) {
      const questao = quiz.questoes[i];

      await tx.quizQuestion.create({
        data: {
          quizId: novoQuiz.id,
          pergunta: questao.pergunta,
          explicacao: questao.explicacao,
          ordem: i + 1,

          alternativas: {
            create: questao.alternativas.map(
              (alternativa, alternativaIndex) => ({
                texto: alternativa.texto,
                correta: alternativa.correta,
                ordem: alternativaIndex + 1,
              }),
            ),
          },
        },
      });
    }

    return tx.quiz.findUnique({
      where: {
        id: novoQuiz.id,
      },
      include: {
        questoes: {
          orderBy: {
            ordem: "asc",
          },
          include: {
            alternativas: {
              orderBy: {
                ordem: "asc",
              },
            },
          },
        },
      },
    });
  });

  if (!quizSalvo) {
    throw new Error("Não foi possível salvar o quiz.");
  }

  console.log(`Quiz salvo com sucesso para o vídeo ${videoId}.`);

  return formatarQuizParaFrontend(quizSalvo);
}

// ============================================================
// GERAÇÃO COM GEMINI
// ============================================================

async function gerarComIA(
  tituloVideo: string,
  resumo: string,
): Promise<QuizGeradoIA> {
  const prompt = `
Você é um especialista em educação e criação de avaliações
para estudantes iniciantes.

Sua tarefa é criar um quiz educativo baseado EXCLUSIVAMENTE
no conteúdo do resumo de uma videoaula.

O objetivo não é verificar se o aluno decorou frases do resumo.
O objetivo é verificar se o aluno realmente compreendeu os
principais conceitos apresentados na aula.

============================================================
INFORMAÇÕES DA AULA
============================================================

Título do vídeo:
${tituloVideo}

Resumo da aula:
${resumo}

============================================================
REGRAS DO QUIZ
============================================================

1. Crie EXATAMENTE 5 questões.

2. Cada questão deve possuir EXATAMENTE 4 alternativas.

3. Cada questão deve possuir EXATAMENTE UMA alternativa correta.

4. As questões devem avaliar principalmente COMPREENSÃO.

Priorize questões que verifiquem:

- o significado de um conceito;
- a finalidade de determinado conceito;
- como um conceito pode ser aplicado;
- a relação entre conceitos;
- interpretação de situações relacionadas ao conteúdo;
- compreensão de exemplos apresentados na aula.

5. EVITE questões baseadas apenas em memorização.

Por exemplo, evite perguntas como:

"Qual foi o nome da ferramenta apresentada?"

Prefira algo como:

"Qual é a principal finalidade dessa ferramenta no contexto apresentado?"

6. NÃO faça perguntas sobre ações operacionais do professor.

Não pergunte sobre:

- cliques;
- menus;
- botões;
- sequência de ações;
- nomes de arquivos usados apenas como exemplo;
- valores utilizados apenas durante uma demonstração;
- ações repetitivas.

7. NÃO INVENTE INFORMAÇÕES.

Todas as questões devem poder ser respondidas utilizando
EXCLUSIVAMENTE o resumo fornecido.

Não utilize conhecimento externo para criar perguntas.

8. As alternativas incorretas devem ser PLAUSÍVEIS.

Evite alternativas obviamente absurdas.

As alternativas incorretas devem representar possíveis
confusões que um aluno iniciante poderia ter.

9. Cada questão deve possuir uma EXPLICAÇÃO.

A explicação deve ser curta e didática e explicar por que
a alternativa correta está correta.

10. Evite questões ambíguas.

Apenas uma alternativa deve ser claramente correta
considerando o conteúdo fornecido.

11. Use linguagem simples.

O público é formado principalmente por estudantes
iniciantes.

Evite linguagem excessivamente acadêmica.

12. Varie o formato das perguntas.

Sempre que o conteúdo permitir, utilize diferentes tipos,
como:

- "Qual é a finalidade de..."
- "Por que..."
- "Qual situação representa..."
- "O que acontece quando..."
- "Qual afirmação está correta..."
- "Qual é a relação entre..."

13. Não repita a mesma ideia em várias questões.

Cada questão deve avaliar um aspecto diferente do conteúdo.

============================================================
FORMATO DA RESPOSTA
============================================================

Retorne SOMENTE um JSON válido.

NÃO utilize:

- Markdown;
- blocos de código;
- explicações fora do JSON;
- comentários;
- texto antes ou depois do JSON.

Utilize exatamente esta estrutura:

{
  "titulo": "Quiz sobre o conteúdo da aula",
  "questoes": [
    {
      "pergunta": "Pergunta aqui",
      "explicacao": "Explicação curta da resposta correta.",
      "alternativas": [
        {
          "texto": "Alternativa A",
          "correta": true
        },
        {
          "texto": "Alternativa B",
          "correta": false
        },
        {
          "texto": "Alternativa C",
          "correta": false
        },
        {
          "texto": "Alternativa D",
          "correta": false
        }
      ]
    }
  ]
}

LEMBRE-SE:

- exatamente 5 questões;
- exatamente 4 alternativas por questão;
- exatamente 1 alternativa correta por questão;
- explicação para cada questão;
- conteúdo baseado somente no resumo;
- linguagem simples e didática;
- sem Markdown;
- somente JSON válido.
`.trim();

  const MAX_TENTATIVAS = 3;

  let ultimoErro: any = null;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      console.log(
        `Gerando quiz com Gemini - tentativa ${tentativa}/${MAX_TENTATIVAS}`,
      );

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      const texto = response.text?.trim();

      if (!texto) {
        throw new Error("Gemini retornou uma resposta vazia.");
      }

      const jsonLimpo = limparJSON(texto);

      const quiz = JSON.parse(jsonLimpo) as QuizGeradoIA;

      validarQuiz(quiz);

      console.log(`Quiz gerado com sucesso na tentativa ${tentativa}.`);

      return quiz;
    } catch (error: any) {
      ultimoErro = error;

      console.warn(`Tentativa ${tentativa} falhou:`, error?.message ?? error);

      const isUltimaTentativa = tentativa === MAX_TENTATIVAS;

      if (isUltimaTentativa) {
        break;
      }

      if (error?.status === 503) {
        const espera = 2000 * tentativa;

        console.log(`Gemini indisponível. Aguardando ${espera}ms...`);

        await esperar(espera);
        continue;
      }

      const espera = 1000 * tentativa;

      console.log(`Resposta inválida. Tentando novamente em ${espera}ms...`);

      await esperar(espera);
    }
  }

  throw new Error(
    `Não foi possível gerar um quiz válido após ${MAX_TENTATIVAS} tentativas. ${
      ultimoErro?.message ?? ""
    }`,
  );
}

// ============================================================
// LIMPA JSON
// ============================================================

function limparJSON(texto: string): string {
  let resultado = texto.trim();

  if (resultado.startsWith("```json")) {
    resultado = resultado.substring(7).trim();
  } else if (resultado.startsWith("```")) {
    resultado = resultado.substring(3).trim();
  }

  if (resultado.endsWith("```")) {
    resultado = resultado.substring(0, resultado.length - 3).trim();
  }

  const inicio = resultado.indexOf("{");
  const fim = resultado.lastIndexOf("}");

  if (inicio !== -1 && fim !== -1 && fim > inicio) {
    resultado = resultado.substring(inicio, fim + 1);
  }

  return resultado;
}

// ============================================================
// VALIDAÇÃO DO QUIZ
// ============================================================

function validarQuiz(quiz: QuizGeradoIA): void {
  if (!quiz.titulo || typeof quiz.titulo !== "string") {
    throw new Error("Quiz sem título.");
  }

  if (!Array.isArray(quiz.questoes)) {
    throw new Error("Quiz sem questões.");
  }

  if (quiz.questoes.length !== 5) {
    throw new Error(
      `Quantidade inválida de questões: ${quiz.questoes.length}. Esperado: 5.`,
    );
  }

  quiz.questoes.forEach((questao, index) => {
    const numeroQuestao = index + 1;

    if (!questao.pergunta || typeof questao.pergunta !== "string") {
      throw new Error(`Questão ${numeroQuestao} está sem pergunta.`);
    }

    if (!questao.explicacao || typeof questao.explicacao !== "string") {
      throw new Error(`Questão ${numeroQuestao} está sem explicação.`);
    }

    if (!Array.isArray(questao.alternativas)) {
      throw new Error(`Questão ${numeroQuestao} não possui alternativas.`);
    }

    if (questao.alternativas.length !== 4) {
      throw new Error(
        `Questão ${numeroQuestao} possui ${questao.alternativas.length} alternativas. Esperado: 4.`,
      );
    }

    const quantidadeCorretas = questao.alternativas.filter(
      (alternativa) => alternativa.correta === true,
    ).length;

    if (quantidadeCorretas !== 1) {
      throw new Error(
        `Questão ${numeroQuestao} possui ${quantidadeCorretas} respostas corretas. Esperado: 1.`,
      );
    }

    questao.alternativas.forEach((alternativa, alternativaIndex) => {
      const numeroAlternativa = alternativaIndex + 1;

      if (!alternativa.texto || typeof alternativa.texto !== "string") {
        throw new Error(
          `Questão ${numeroQuestao}, alternativa ${numeroAlternativa} está sem texto.`,
        );
      }

      if (typeof alternativa.correta !== "boolean") {
        throw new Error(
          `Questão ${numeroQuestao}, alternativa ${numeroAlternativa} possui "correta" inválido.`,
        );
      }
    });
  });
}

// ============================================================
// FORMATAÇÃO PARA O FRONTEND
// ============================================================

function formatarQuizParaFrontend(quiz: any) {
  return {
    id: quiz.id,
    titulo: quiz.titulo,

    questoes: quiz.questoes.map((questao: any) => ({
      id: questao.id,
      pergunta: questao.pergunta,
      explicacao: questao.explicacao,

      alternativas: questao.alternativas.map((alternativa: any) => ({
        id: alternativa.id,
        texto: alternativa.texto,
      })),
    })),
  };
}

// ============================================================
// TIPOS PARA CORREÇÃO
// ============================================================

export interface RespostaQuiz {
  questionId: string;
  optionId: string;
}

// ============================================================
// CORRIGIR QUIZ
// ============================================================

export async function corrigirQuiz(
  quizId: string,
  userId: string,
  respostas: RespostaQuiz[],
) {
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId,
    },
    include: {
      questoes: {
        orderBy: {
          ordem: "asc",
        },
        include: {
          alternativas: {
            orderBy: {
              ordem: "asc",
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    throw new Error("Quiz não encontrado.");
  }

  if (!Array.isArray(respostas)) {
    throw new Error("Respostas inválidas.");
  }

  // Todas as questões precisam ser respondidas
  if (respostas.length !== quiz.questoes.length) {
    throw new Error(
      `O quiz possui ${quiz.questoes.length} questões e todas devem ser respondidas.`,
    );
  }

  // Evita enviar a mesma questão duas vezes
  const questionIds = respostas.map((resposta) => resposta.questionId);

  if (new Set(questionIds).size !== questionIds.length) {
    throw new Error(
      "Não é permitido responder a mesma questão mais de uma vez.",
    );
  }

  let acertos = 0;

  const resultadoQuestoes = quiz.questoes.map((questao) => {
    const resposta = respostas.find((item) => item.questionId === questao.id);

    if (!resposta) {
      throw new Error(`A questão ${questao.ordem} não foi respondida.`);
    }

    const alternativaSelecionada = questao.alternativas.find(
      (alternativa) => alternativa.id === resposta.optionId,
    );

    if (!alternativaSelecionada) {
      throw new Error(`Alternativa inválida para a questão ${questao.ordem}.`);
    }

    const alternativaCorreta = questao.alternativas.find(
      (alternativa) => alternativa.correta === true,
    );

    if (!alternativaCorreta) {
      throw new Error(
        `A questão ${questao.ordem} não possui uma alternativa correta configurada.`,
      );
    }

    const acertou = alternativaSelecionada.id === alternativaCorreta.id;

    if (acertou) {
      acertos++;
    }

    return {
      questionId: questao.id,
      pergunta: questao.pergunta,

      alternativaSelecionada: {
        id: alternativaSelecionada.id,
        texto: alternativaSelecionada.texto,
      },

      alternativaCorreta: {
        id: alternativaCorreta.id,
        texto: alternativaCorreta.texto,
      },

      acertou,

      explicacao: questao.explicacao,
    };
  });

  // ==========================================================
  // PONTUAÇÃO
  // ==========================================================

  const totalQuestoes = quiz.questoes.length;

  const pontuacao = acertos;

  const percentual = totalQuestoes > 0 ? (pontuacao / totalQuestoes) * 100 : 0;

  // ==========================================================
  // SALVAMENTO DA TENTATIVA
  // ==========================================================

  const tentativa = await prisma.$transaction(async (tx) => {
    const novaTentativa = await tx.quizAttempt.create({
      data: {
        userId,
        quizId,
        pontuacao,
        total: totalQuestoes,
        percentual,
      },
    });

    // Salva cada resposta
    for (const resultado of resultadoQuestoes) {
      await tx.quizAnswer.create({
        data: {
          attemptId: novaTentativa.id,
          questionId: resultado.questionId,
          optionId: resultado.alternativaSelecionada.id,
          correta: resultado.acertou,
        },
      });
    }

    return tx.quizAttempt.findUnique({
      where: {
        id: novaTentativa.id,
      },
      include: {
        respostas: true,
      },
    });
  });

  if (!tentativa) {
    throw new Error("Não foi possível salvar a tentativa.");
  }

  // ==========================================================
  // RETORNO
  // ==========================================================

  return {
    id: tentativa.id,
    quizId,
    pontuacao,
    total: totalQuestoes,
    percentual,
    respostas: resultadoQuestoes,
  };
}

// ============================================================
// UTILITÁRIO DE ESPERA
// ============================================================

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
