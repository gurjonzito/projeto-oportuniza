import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export interface RespostasQuestionario {
  objetivo: string;
  nivel: string;
  areas: string[];
  tempoSemanal: string;
}

export interface TrilhaDisponivel {
  id: string;
  titulo: string;
  slug: string;
  categoria: string;
  nivel: string;
  totalVideos: number;
}

export interface ResultadoRecomendacao {
  id: string;
  compatibilidade: number;
  justificativa: string;
}

export async function recomendarTrilhas(
  respostas: RespostasQuestionario,
  trilhasDisponiveis: TrilhaDisponivel[],
): Promise<ResultadoRecomendacao[]> {
  if (!respostas) {
    throw new Error("Respostas do questionário não informadas.");
  }

  if (
    !respostas.objetivo ||
    !respostas.nivel ||
    !respostas.tempoSemanal
  ) {
    throw new Error(
      "O questionário não foi preenchido completamente.",
    );
  }

  if (
    !Array.isArray(respostas.areas) ||
    respostas.areas.length === 0
  ) {
    throw new Error(
      "Selecione pelo menos uma área de interesse.",
    );
  }

  if (
    !Array.isArray(trilhasDisponiveis) ||
    trilhasDisponiveis.length === 0
  ) {
    return [];
  }

  const trilhasResumo = trilhasDisponiveis.map((trilha) => ({
    id: String(trilha.id),
    titulo: trilha.titulo,
    slug: trilha.slug,
    categoria: trilha.categoria || "Sem categoria",
    nivel: trilha.nivel || "Não informado",
    totalVideos: Number(trilha.totalVideos) || 0,
  }));

  const prompt = `
Você é o sistema de recomendação personalizada da plataforma Oportuniza Jovem.

Sua função é analisar o perfil de um jovem e identificar quais das trilhas disponíveis na plataforma são mais adequadas para ele.

============================================================
REGRAS IMPORTANTES
============================================================

- Você só pode recomendar trilhas que estejam na lista "Trilhas disponíveis".
- Nunca invente uma trilha.
- Nunca altere o ID de uma trilha.
- O ID deve ser retornado exatamente como foi fornecido.
- Avalie o perfil completo do usuário antes de recomendar.
- A compatibilidade deve ser um número inteiro entre 0 e 100.
- Não recomende uma trilha apenas porque a categoria é semelhante.
- Considere objetivo, nível, áreas de interesse e disponibilidade.
- Trilhas diretamente relacionadas ao objetivo do usuário devem receber maior prioridade.
- Evite recomendar conteúdos muito avançados para usuários iniciantes.
- Considere a quantidade de vídeos em relação ao tempo disponível.
- Uma trilha pode receber uma pontuação menor quando for relevante, mas pouco adequada ao tempo ou nível do usuário.
- Inclua somente trilhas com compatibilidade igual ou superior a 40.
- Retorne no máximo 3 recomendações.
- Ordene as recomendações da maior para a menor compatibilidade.
- Se nenhuma trilha for realmente adequada, retorne um array vazio.
- Não tente criar uma nova trilha para preencher o resultado.

============================================================
PERFIL DO USUÁRIO
============================================================

Objetivo principal:
${respostas.objetivo}

Nível de conhecimento atual:
${respostas.nivel}

Áreas de interesse:
${respostas.areas.join(", ")}

Disponibilidade semanal:
${respostas.tempoSemanal}

============================================================
TRILHAS DISPONÍVEIS NA PLATAFORMA
============================================================

${JSON.stringify(trilhasResumo, null, 2)}

============================================================
CRITÉRIOS DE AVALIAÇÃO
============================================================

1. OBJETIVO

Verifique o quanto a trilha contribui para o objetivo principal informado pelo usuário.

O objetivo deve ser o fator mais importante da recomendação.

2. NÍVEL

Verifique se o nível da trilha é adequado ao conhecimento atual do usuário.

Usuários iniciantes devem ter preferência por trilhas básicas.

Evite recomendar uma trilha avançada para alguém que informou ser iniciante, salvo quando houver uma justificativa muito forte.

3. ÁREAS DE INTERESSE

Verifique se a categoria e o tema da trilha estão relacionados às áreas de interesse informadas.

4. DISPONIBILIDADE

Considere a quantidade de vídeos da trilha em relação ao tempo semanal disponível.

Não descarte automaticamente uma trilha longa, mas reduza sua compatibilidade quando a carga de conteúdo parecer incompatível com a disponibilidade do usuário.

5. RELEVÂNCIA PROFISSIONAL

Considere o quanto a trilha pode ajudar o usuário a desenvolver conhecimentos e habilidades úteis para seu objetivo.

============================================================
PONTUAÇÃO
============================================================

A pontuação deve representar a adequação geral da trilha ao perfil.

Como referência:

90-100:
Excelente correspondência com o perfil.

75-89:
Muito boa correspondência.

60-74:
Boa correspondência.

40-59:
Correspondência moderada.

0-39:
Não recomendar.

Não atribua notas altas apenas porque a categoria é parecida.

============================================================
JUSTIFICATIVA
============================================================

Para cada recomendação, escreva uma justificativa curta e personalizada.

A justificativa deve explicar por que aquela trilha é adequada para aquele usuário.

Evite frases genéricas como:

"Essa trilha é boa para você."

Prefira justificativas como:

"Essa trilha está diretamente relacionada ao seu objetivo de conseguir o primeiro emprego e apresenta conteúdos adequados ao seu nível iniciante."

============================================================
FORMATO DA RESPOSTA
============================================================

Retorne SOMENTE um array JSON válido.

Não utilize Markdown.

Não utilize blocos de código.

Não inclua explicações antes ou depois do JSON.

Utilize exatamente esta estrutura:

[
  {
    "id": "id-da-trilha",
    "compatibilidade": 92,
    "justificativa": "Essa trilha está diretamente relacionada ao seu objetivo e apresenta conteúdos adequados ao seu nível."
  }
]

Se nenhuma trilha atingir 40% de compatibilidade, retorne:

[]

Lembre-se:

- máximo de 3 recomendações;
- somente trilhas disponíveis;
- IDs exatamente iguais aos fornecidos;
- compatibilidade entre 0 e 100;
- somente recomendações com pelo menos 40%;
- ordem decrescente de compatibilidade;
- justificativas personalizadas;
- somente JSON válido.
`.trim();

  const MAX_TENTATIVAS = 3;

  let ultimoErro: any = null;

  for (
    let tentativa = 1;
    tentativa <= MAX_TENTATIVAS;
    tentativa++
  ) {
    try {
      console.log(
        `Gerando recomendações com Gemini - tentativa ${tentativa}/${MAX_TENTATIVAS}`,
      );

      const response =
        await genAI.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        });

      const texto = response.text?.trim();

      if (!texto) {
        throw new Error(
          "Gemini retornou uma resposta vazia.",
        );
      }

      const jsonLimpo = limparJSON(texto);

      const resultado =
        JSON.parse(
          jsonLimpo,
        ) as ResultadoRecomendacao[];

      validarResultado(
        resultado,
        trilhasDisponiveis,
      );

      console.log(
        `Recomendações geradas com sucesso na tentativa ${tentativa}.`,
      );

      return resultado;
    } catch (error: any) {
      ultimoErro = error;

      console.warn(
        `Tentativa ${tentativa} falhou:`,
        error?.message ?? error,
      );

      if (tentativa === MAX_TENTATIVAS) {
        break;
      }

      const espera = 1000 * tentativa;

      console.log(
        `Tentando novamente em ${espera}ms...`,
      );

      await esperar(espera);
    }
  }

  throw new Error(
    `Não foi possível gerar recomendações válidas após ${MAX_TENTATIVAS} tentativas. ${
      ultimoErro?.message ?? ""
    }`,
  );
}

function limparJSON(texto: string): string {
  let resultado = texto.trim();

  if (resultado.startsWith("```json")) {
    resultado = resultado
      .substring(7)
      .trim();
  } else if (resultado.startsWith("```")) {
    resultado = resultado
      .substring(3)
      .trim();
  }

  if (resultado.endsWith("```")) {
    resultado = resultado
      .substring(0, resultado.length - 3)
      .trim();
  }

  const inicio = resultado.indexOf("[");
  const fim = resultado.lastIndexOf("]");

  if (
    inicio !== -1 &&
    fim !== -1 &&
    fim > inicio
  ) {
    resultado = resultado.substring(
      inicio,
      fim + 1,
    );
  }

  return resultado;
}

function validarResultado(
  resultado: ResultadoRecomendacao[],
  trilhasDisponiveis: TrilhaDisponivel[],
): void {
  if (!Array.isArray(resultado)) {
    throw new Error(
      "A resposta da IA não é um array.",
    );
  }

  if (resultado.length > 3) {
    throw new Error(
      "A IA retornou mais de 3 recomendações.",
    );
  }

  const idsDisponiveis = new Set(
    trilhasDisponiveis.map((trilha) =>
      String(trilha.id),
    ),
  );

  const idsRetornados = new Set<string>();

  for (const item of resultado) {
    if (!item.id) {
      throw new Error(
        "Recomendação sem ID.",
      );
    }

    const id = String(item.id);

    if (!idsDisponiveis.has(id)) {
      throw new Error(
        `A IA retornou uma trilha inexistente: ${id}`,
      );
    }

    if (idsRetornados.has(id)) {
      throw new Error(
        `A IA retornou a trilha ${id} mais de uma vez.`,
      );
    }

    idsRetornados.add(id);

    if (
      !Number.isInteger(
        item.compatibilidade,
      ) ||
      item.compatibilidade < 0 ||
      item.compatibilidade > 100
    ) {
      throw new Error(
        `Compatibilidade inválida para a trilha ${id}.`,
      );
    }

    if (
      !item.justificativa ||
      typeof item.justificativa !== "string"
    ) {
      throw new Error(
        `Justificativa inválida para a trilha ${id}.`,
      );
    }

    if (item.compatibilidade < 40) {
      throw new Error(
        `A trilha ${id} possui compatibilidade abaixo de 40%.`,
      );
    }
  }

  for (
    let i = 1;
    i < resultado.length;
    i++
  ) {
    if (
      resultado[i].compatibilidade >
      resultado[i - 1].compatibilidade
    ) {
      throw new Error(
        "As recomendações não estão ordenadas por compatibilidade.",
      );
    }
  }
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}