// Chroma + templates — porte de cordel/audio/croma.py. Usado como método
// principal de reconhecimento de acorde na versão web (sem calibração por
// aluno: sem dicionário/NNLS, ver README para a limitação e o roteiro de v2).

export const QUALIDADES_TEMPLATE: Record<string, number[]> = {
  maj: [0, 4, 7],
  m: [0, 3, 7],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  add9: [0, 2, 4, 7],
  "5": [0, 7],
};

export const NOMES_NOTA = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function normalizar(vetor: number[]): number[] {
  const norma = Math.sqrt(vetor.reduce((s, v) => s + v * v, 0));
  return norma > 1e-12 ? vetor.map((v) => v / norma) : vetor;
}

export function construirTemplates(): Record<string, number[]> {
  const templates: Record<string, number[]> = {};
  for (let fundamental = 0; fundamental < 12; fundamental++) {
    for (const [qualidade, intervalos] of Object.entries(QUALIDADES_TEMPLATE)) {
      const vetor = new Array(12).fill(0);
      for (const i of intervalos) vetor[(fundamental + i) % 12] = 1.0;
      const simbolo = `${NOMES_NOTA[fundamental]}${qualidade === "maj" ? "" : qualidade}`;
      templates[simbolo] = normalizar(vetor);
    }
  }
  return templates;
}

export const TEMPLATES = construirTemplates();

// Chroma de 12 bins a partir de um espectro de magnitude (FFT), somando a
// energia de cada bin de frequência na sua pitch class (equivalente
// simplificado ao chroma_cqt do librosa, suficiente para casamento de
// template em tempo real no navegador).
export function chromaDoEspectro(magnitudes: Float32Array, sampleRate: number, fftSize: number, fMin = 80, fMax = 1200): number[] {
  const chroma = new Array(12).fill(0);
  const binHz = sampleRate / fftSize;
  const binMin = Math.max(1, Math.floor(fMin / binHz));
  const binMax = Math.min(magnitudes.length - 1, Math.ceil(fMax / binHz));
  for (let bin = binMin; bin <= binMax; bin++) {
    const freq = bin * binHz;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const pc = ((Math.round(midi) % 12) + 12) % 12;
    chroma[pc] += magnitudes[bin];
  }
  return normalizar(chroma);
}

export function melhorPalpite(chromaVec: number[]): [string, number] {
  let melhorSimbolo = "";
  let melhorScore = -1;
  for (const [simbolo, template] of Object.entries(TEMPLATES)) {
    let score = 0;
    for (let i = 0; i < 12; i++) score += chromaVec[i] * template[i];
    if (score > melhorScore) {
      melhorSimbolo = simbolo;
      melhorScore = score;
    }
  }
  return [melhorSimbolo, Math.max(0, melhorScore)];
}

// Similaridade do chroma observado contra o conjunto de pitch classes
// esperado do acorde alvo (vindo de lib/tipos.ts: pitchClassesDoAcorde).
// Mais robusto que "melhor palpite entre 108 templates" para o nosso caso,
// porque já sabemos qual acorde o aluno está tentando tocar.
export function similaridadeComAlvo(chromaVec: number[], pitchClassesAlvo: number[]): number {
  const alvo = new Array(12).fill(0);
  for (const pc of pitchClassesAlvo) alvo[pc] = 1;
  const alvoNorm = normalizar(alvo);
  let score = 0;
  for (let i = 0; i < 12; i++) score += chromaVec[i] * alvoNorm[i];
  return Math.max(0, score);
}
