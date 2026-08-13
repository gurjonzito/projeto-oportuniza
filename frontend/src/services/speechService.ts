let textoCompleto = "";
let offsetAtual = 0;

// Posição absoluta da última palavra falada
let ultimaPosicaoAbsoluta = 0;

let callbackOnStart: (() => void) | undefined;
let callbackOnEnd: (() => void) | undefined;

let cancelamentoManual = false;

/**
 * Remove elementos de Markdown que não devem ser lidos pelo áudio.
 * O resumo original continua intacto na tela.
 */
function limparTextoParaAudio(texto: string): string {
  return texto
    // Remove blocos de código
    .replace(/```[\s\S]*?```/g, "")

    // Remove imagens: ![texto](url)
    .replace(/!\[.*?\]\(.*?\)/g, "")

    // Links: [texto](url) -> texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

    // Negrito + itálico: ***texto*** ou ___texto___
    .replace(/(\*\*\*|___)(.*?)\1/g, "$2")

    // Negrito: **texto** ou __texto__
    .replace(/(\*\*|__)(.*?)\1/g, "$2")

    // Itálico: *texto* ou _texto_
    .replace(/(\*|_)(.*?)\1/g, "$2")

    // Títulos: ### Título -> Título
    .replace(/^#{1,6}\s+/gm, "")

    // Citações: > texto -> texto
    .replace(/^>\s?/gm, "")

    // Listas com -, * ou +
    .replace(/^\s*[-*+]\s+/gm, "")

    // Listas numeradas: 1. Texto -> Texto
    .replace(/^\s*\d+\.\s+/gm, "")

    // Código inline: `texto` -> texto
    .replace(/`([^`]+)`/g, "$1")

    // Remove caracteres Markdown restantes
    .replace(/[*_~#`]/g, "")

    // Normaliza espaços
    .replace(/\s+/g, " ")

    .trim();
}

function falarDoOffset(offset: number) {
  const trecho = textoCompleto.slice(offset);

  if (!trecho.trim()) {
    callbackOnEnd?.();
    return;
  }

  ultimaPosicaoAbsoluta = offset;
  cancelamentoManual = false;

  const utterance = new SpeechSynthesisUtterance(trecho);

  utterance.lang = "pt-BR";
  utterance.rate = 0.75;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    callbackOnStart?.();
  };

  utterance.onboundary = (event) => {
    if (event.charIndex !== undefined) {
      // charIndex é relativo ao trecho atual.
      // Transformamos em posição absoluta.
      ultimaPosicaoAbsoluta = offset + event.charIndex;
    }
  };

  utterance.onend = () => {
    if (!cancelamentoManual) {
      offsetAtual = textoCompleto.length;
      callbackOnEnd?.();
    }
  };

  utterance.onerror = () => {
    if (!cancelamentoManual) {
      callbackOnEnd?.();
    }
  };

  window.speechSynthesis.speak(utterance);
}

export function ouvirResumo(
  texto: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!texto?.trim()) return;

  // Cancela qualquer áudio anterior
  cancelamentoManual = true;
  window.speechSynthesis.cancel();

  // Limpa apenas a versão usada pelo áudio.
  // O resumo original continua formatado na tela.
  textoCompleto = limparTextoParaAudio(texto);

  if (!textoCompleto) {
    onEnd?.();
    return;
  }

  offsetAtual = 0;
  ultimaPosicaoAbsoluta = 0;

  callbackOnStart = onStart;
  callbackOnEnd = onEnd;

  // Pequeno intervalo para ajudar no mobile após cancel()
  setTimeout(() => {
    if (!textoCompleto) return;

    falarDoOffset(offsetAtual);
  }, 50);
}

export function pausarResumo() {
  if (!window.speechSynthesis.speaking) return;

  // Guarda a última posição absoluta conhecida.
  offsetAtual = ultimaPosicaoAbsoluta;

  cancelamentoManual = true;

  window.speechSynthesis.cancel();
}

export function continuarResumo() {
  if (!textoCompleto) return;

  // Evita iniciar outra fala enquanto uma já está ativa.
  if (window.speechSynthesis.speaking) return;

  if (offsetAtual >= textoCompleto.length) {
    callbackOnEnd?.();
    return;
  }

  cancelamentoManual = false;

  falarDoOffset(offsetAtual);
}

export function pararResumo(onEnd?: () => void) {
  cancelamentoManual = true;

  window.speechSynthesis.cancel();

  textoCompleto = "";
  offsetAtual = 0;
  ultimaPosicaoAbsoluta = 0;

  callbackOnStart = undefined;
  callbackOnEnd = undefined;

  onEnd?.();
}
