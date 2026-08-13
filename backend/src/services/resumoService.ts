import { GoogleGenAI } from "@google/genai";
import { YoutubeTranscript } from "youtube-transcript";
import { prisma } from "../config/prisma";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const USE_MOCK = process.env.USE_AI_MOCK === "true";

export async function gerarResumo(videoId: string): Promise<string> {
  const video = await prisma.video.findUnique({
    where: { youtubeVideoId: videoId },
    select: { resumoIA: true, titulo: true, descricao: true },
  });

  if (!video) return "Vídeo não encontrado.";
  if (video.resumoIA) return video.resumoIA;

  const resumo = USE_MOCK
    ? gerarMock(video.titulo)
    : await gerarComIA(videoId, video.titulo, video.descricao ?? "");

  await prisma.video.update({
    where: { youtubeVideoId: videoId },
    data: { resumoIA: resumo },
  });

  return resumo;
}

function gerarMock(titulo: string): string {
  return `
**Resumo gerado em modo de teste**

Neste vídeo sobre "${titulo}", você vai aprender:

- Conceitos fundamentais do tema abordado
- Exemplos práticos aplicados ao dia a dia
- Dicas para fixar o conteúdo
- Como aplicar o aprendizado no mercado de trabalho
  `.trim();
}

async function buscarTranscricao(videoId: string): Promise<string | null> {
  try {
    // Tenta português primeiro, depois inglês como fallback
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "pt",
    }).catch(() =>
      YoutubeTranscript.fetchTranscript(videoId, { lang: "en" })
    );

    if (!transcript || transcript.length === 0) return null;

    const texto = transcript.map((item) => item.text).join(" ");

    // Limita a ~6000 palavras para não estourar o contexto da IA
    const palavras = texto.split(" ");
    return palavras.length > 6000
      ? palavras.slice(0, 6000).join(" ") + "..."
      : texto;
  } catch {
    return null;
  }
}

async function gerarComIA(
  videoId: string,
  titulo: string,
  descricao: string
): Promise<string> {
  const transcricao = await buscarTranscricao(videoId);

  const conteudo = transcricao
    ? `Transcrição do vídeo:\n${transcricao}`
    : `Descrição do vídeo:\n${descricao}\n\n(Transcrição não disponível — resumo baseado na descrição)`;

  const prompt = `
Você é um assistente educacional especializado em transformar videoaulas em resumos de estudo.

Seu objetivo NÃO é descrever o que o professor fez durante o vídeo.
Seu objetivo é explicar, de forma simples, o CONTEÚDO E OS CONHECIMENTOS que o aluno deve compreender depois de assistir ao vídeo.

Título do vídeo: ${titulo}

${conteudo}

REGRAS IMPORTANTES:

1. RESUMA O CONTEÚDO, NÃO O PASSO A PASSO
- Não descreva a sequência de ações realizadas pelo professor.
- Não transforme o vídeo em um tutorial.
- Não diga coisas como "o professor clicou", "depois ele abriu", "em seguida criou", "foi até a aba", "importou um arquivo" ou "adicionou um gráfico".
- Quando o vídeo demonstrar uma ação prática, explique qual CONCEITO ou FINALIDADE aquela ação ensina.

2. PRIORIZE O ENTENDIMENTO
O resumo deve responder principalmente:
- O que é o assunto apresentado?
- Quais conceitos são ensinados?
- Para que esses conceitos servem?
- Como eles se relacionam?
- O que um iniciante precisa entender sobre esse assunto?

3. TRANSFORME EXEMPLOS PRÁTICOS EM CONCEITOS
Se o professor utilizar um exemplo para ensinar algo, não descreva apenas o exemplo.
Extraia o conhecimento por trás dele.

Exemplo:
ERRADO:
"O professor importa uma planilha do Excel e depois cria um gráfico de barras."

CERTO:
"O Power BI pode utilizar dados de planilhas para criar análises visuais. Os gráficos permitem comparar valores e identificar padrões nos dados."

Outro exemplo:

ERRADO:
"O professor seleciona a coluna de preço e multiplica pela quantidade para criar uma nova coluna."

CERTO:
"É possível criar colunas calculadas a partir dos dados existentes, permitindo obter novas informações, como o faturamento resultante do preço multiplicado pela quantidade."

4. IGNORE DETALHES OPERACIONAIS DESNECESSÁRIOS
Não inclua:
- cliques;
- menus acessados;
- botões pressionados;
- sequência de etapas;
- instalação de programas, salvo se a instalação for o próprio assunto da aula;
- nomes de arquivos usados apenas como exemplo;
- valores específicos utilizados apenas na demonstração;
- ações repetitivas realizadas pelo professor.

5. INCLUA DETALHES PRÁTICOS SOMENTE QUANDO ELES REPRESENTAREM UM CONCEITO
Uma ferramenta, recurso ou funcionalidade pode ser mencionada quando for importante para compreender o conteúdo.
Nesse caso, explique sua finalidade e não apenas como utilizá-la.

6. NÃO INVENTE CONTEÚDO
O resumo deve ser baseado exclusivamente no conteúdo fornecido.
Não adicione conceitos que não tenham sido explicados ou claramente apresentados no vídeo.

7. LINGUAGEM
- Use linguagem simples e didática.
- Escreva para alguém que está começando a estudar o assunto.
- Explique termos técnicos brevemente quando necessário.
- Evite linguagem excessivamente acadêmica.
- O aluno deve conseguir entender o assunto sem precisar assistir novamente ao vídeo apenas para descobrir o significado dos conceitos apresentados.

8. ESTRUTURA
Comece com um pequeno parágrafo explicando o assunto geral da aula.

Depois, apresente os principais conceitos aprendidos em tópicos no formato:
"- Nome do conceito: explicação do que significa e para que serve."

Cada tópico deve explicar uma IDEIA ou CONCEITO, e não uma ação realizada no vídeo.

NÃO use markdown, asteriscos, hashtags, negrito, itálico ou qualquer formatação especial.
Escreva apenas texto simples.

9. FOCO NO APRENDIZADO
Imagine que o vídeo será removido e o aluno terá apenas este resumo para revisar o conteúdo.
O resumo deve permitir que ele entenda:
- quais são os principais conceitos;
- o que eles significam;
- para que servem;
- como se relacionam com o tema da aula.

10. TAMANHO
- Entre 150 e 300 palavras.
- Seja conciso, mas não omita conceitos importantes.
- Não repita informações.

IMPORTANTE:
Antes de escrever, identifique mentalmente quais partes da transcrição representam:
A) conhecimento/conceitos ensinados;
B) demonstrações práticas;
C) ações operacionais feitas pelo professor.

Use principalmente A.
Use B apenas para explicar melhor A.
Ignore C, exceto quando a ação em si for parte importante do conhecimento ensinado.

O resultado final deve parecer um RESUMO DE ESTUDO DE UMA AULA, e não um RESUMO DO QUE ACONTECEU NO VÍDEO.
`.trim();

  const MAX_TENTATIVAS = 3;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      return response.text ?? "Resumo indisponível.";
    } catch (error: any) {
      const is503 = error?.status === 503;
      const isUltimaTentativa = tentativa === MAX_TENTATIVAS;

      console.warn(`Tentativa ${tentativa} falhou (${error?.status ?? "erro"}).`);

      if (isUltimaTentativa || !is503) throw error;

      await new Promise((resolve) => setTimeout(resolve, 2000 * tentativa));
    }
  }

  throw new Error("Falha ao gerar resumo após todas as tentativas.");
}