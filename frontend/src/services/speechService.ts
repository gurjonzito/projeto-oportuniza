let textoCompleto = "";
let offsetAtual = 0; // posição (em caracteres) de onde a fala deve continuar
let ultimoBoundaryLocal = 0; // posição da última palavra dentro do trecho atual

let callbackOnStart: (() => void) | undefined;
let callbackOnEnd: (() => void) | undefined;

function falarDoOffset(offset: number) {
  const trecho = textoCompleto.slice(offset);

  if (!trecho.trim()) {
    callbackOnEnd?.();
    return;
  }

  ultimoBoundaryLocal = 0;

  const utterance = new SpeechSynthesisUtterance(trecho);
  utterance.lang = "pt-BR";

  utterance.onstart = () => {
    if (offset === 0) {
      callbackOnStart?.();
    }
  };

  // Disparado a cada palavra falada — é isso que nos dá a posição exata
  utterance.onboundary = (event) => {
    if (event.name === "word" || event.charIndex !== undefined) {
      ultimoBoundaryLocal = event.charIndex;
    }
  };

  utterance.onend = () => {
    callbackOnEnd?.();
  };

  utterance.onerror = () => {
    // Erro esperado quando cancelamos manualmente pra pausar — ignoramos
  };

  window.speechSynthesis.speak(utterance);
}

export function ouvirResumo(
  texto: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!texto) return;

  window.speechSynthesis.cancel();

  textoCompleto = texto.replace(/\s+/g, " ").trim();
  offsetAtual = 0;

  callbackOnStart = onStart;
  callbackOnEnd = onEnd;

  falarDoOffset(offsetAtual);
}

export function pausarResumo() {
  if (!window.speechSynthesis.speaking) return;

  // Guarda exatamente onde a fala estava (na palavra atual)
  offsetAtual += ultimoBoundaryLocal;

  // cancel() para IMEDIATAMENTE — diferente de pause(), que é instável no Chrome
  window.speechSynthesis.cancel();
}

export function continuarResumo() {
  falarDoOffset(offsetAtual);
}

export function pararResumo(onEnd?: () => void) {
  window.speechSynthesis.cancel();

  textoCompleto = "";
  offsetAtual = 0;
  ultimoBoundaryLocal = 0;

  callbackOnStart = undefined;
  callbackOnEnd = undefined;

  onEnd?.();
}