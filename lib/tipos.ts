// Tipos do projeto Cordel — porte direto de cordel/tipos.py
// Cordas: 1 = Mi agudo ... 6 = Mi grave. Dedos: 1 indicador, 2 médio, 3 anelar, 4 mínimo.
// Casas: 0 = corda solta, 1..N a partir da pestana.

export const AFINACAO_PADRAO_MIDI: Record<number, number> = {
  6: 40,
  5: 45,
  4: 50,
  3: 55,
  2: 59,
  1: 64,
};

export const NOMES_PITCH_CLASS = [
  "Dó", "Dó#", "Ré", "Ré#", "Mi", "Fá",
  "Fá#", "Sol", "Sol#", "Lá", "Lá#", "Si",
];

export function pitchClass(midi: number): number {
  return ((midi % 12) + 12) % 12;
}

export function nomePitchClass(pc: number): string {
  return NOMES_PITCH_CLASS[((pc % 12) + 12) % 12];
}

export function midiDaCorda(corda: number, casa: number, afinacao: Record<number, number> = AFINACAO_PADRAO_MIDI): number {
  return afinacao[corda] + casa;
}

export interface PosicaoDedo {
  dedo: number; // 1..4 (0 = polegar)
  corda: number; // 1..6
  casa: number; // 1..N
  pestana?: boolean;
  cordas_pestana?: number[];
}

export interface Acorde {
  id: string;
  nome: string;
  simbolo: string;
  posicoes: PosicaoDedo[];
  soltas: number[];
  abafadas: number[];
  modulo: number;
  dificuldade: number;
  dicas: string[];
}

export interface Licao {
  id: string;
  modulo: number;
  titulo: string;
  objetivo: string;
  tipo_exercicio: string;
  acordes: string[];
  criterio_conclusao: { tipo: string; [k: string]: unknown };
  xp: number;
  pre_requisitos: string[];
  opcional?: boolean;
  batida?: string;
  bpm?: number;
  repeticoes?: number;
}

export interface PerfilJogador {
  xp: number;
  nivel: number;
  streak: number;
  freezes_disponiveis: number;
  medalhas: string[];
  titulo_atual: string;
  ultima_sessao: string | null; // ISO date
  licoes_concluidas: string[];
}

export function perfilInicial(): PerfilJogador {
  return {
    xp: 0,
    nivel: 1,
    streak: 0,
    freezes_disponiveis: 1,
    medalhas: [],
    titulo_atual: "Curioso das Cordas",
    ultima_sessao: null,
    licoes_concluidas: [],
  };
}

export function cordasTocadas(acorde: Acorde): number[] {
  const s = new Set<number>(acorde.soltas);
  for (const p of acorde.posicoes) s.add(p.corda);
  return Array.from(s).sort((a, b) => a - b);
}

export function pitchClassesDoAcorde(acorde: Acorde): number[] {
  const midis: number[] = [];
  for (const corda of acorde.soltas) midis.push(midiDaCorda(corda, 0));
  for (const p of acorde.posicoes) midis.push(midiDaCorda(p.corda, p.casa));
  return Array.from(new Set(midis.map(pitchClass))).sort((a, b) => a - b);
}
