// Gamificação: XP, níveis, títulos, medalhas, streak — porte direto de
// cordel/motor/progresso.py. Curva de XP: xp_necessario(n) = 100 * n^1.45.

import { PerfilJogador } from "./tipos";

export const N_NIVEIS = 30;
export const XP_BASE_LICAO = 50;
export const XP_TENTATIVA_APROVADA = 10;
export const XP_BONUS_LIMPEZA_MAXIMO = 15;
export const LIMIAR_NOTA_BONUS = 85.0;

export const TITULOS: [number, string][] = [
  [1, "Curioso das Cordas"],
  [3, "Afinador de Primeira"],
  [6, "Dedilhador"],
  [10, "Trocador Veloz"],
  [14, "Mão Direita Firme"],
  [20, "Domador de Pestana"],
  [30, "Violonista"],
];

export const MEDALHAS: Record<string, string> = {
  primeiro_acorde_limpo: "Primeiro Acorde Limpo",
  "60_tpm": "60 TPM",
  semana_inteira: "Semana Inteira",
  pestana_vencida: "Pestana Vencida",
  sem_trastejar: "Sem Trastejar",
  ouvido_absoluto: "Ouvido Absoluto",
  madrugador: "Madrugador",
  maratona: "Maratona",
};

export function xpNecessario(nivel: number): number {
  if (nivel <= 1) return 0;
  return Math.round(100 * Math.pow(nivel, 1.45));
}

export function nivelParaXp(xpTotal: number): number {
  let nivel = 1;
  while (nivel < N_NIVEIS && xpTotal >= xpNecessario(nivel + 1)) nivel += 1;
  return nivel;
}

export function tituloParaNivel(nivel: number): string {
  let tituloAtual = TITULOS[0][1];
  for (const [nivelMinimo, nome] of TITULOS) {
    if (nivel >= nivelMinimo) tituloAtual = nome;
  }
  return tituloAtual;
}

export function xpPorTentativa(nota: number, aprovado: boolean): number {
  if (!aprovado) return 0;
  let xp = XP_TENTATIVA_APROVADA;
  if (nota > LIMIAR_NOTA_BONUS) {
    const proporcao = Math.min(1.0, (nota - LIMIAR_NOTA_BONUS) / (100 - LIMIAR_NOTA_BONUS));
    xp += Math.round(XP_BONUS_LIMPEZA_MAXIMO * proporcao);
  }
  return xp;
}

export function xpPorLicaoConcluida(): number {
  return XP_BASE_LICAO;
}

export function aplicarXp(perfil: PerfilJogador, xpGanho: number): PerfilJogador {
  const novoXp = perfil.xp + xpGanho;
  const novoNivel = nivelParaXp(novoXp);
  return { ...perfil, xp: novoXp, nivel: novoNivel, titulo_atual: tituloParaNivel(novoNivel) };
}

export function concederMedalha(perfil: PerfilJogador, medalhaId: string): PerfilJogador {
  if (perfil.medalhas.includes(medalhaId)) return perfil;
  return { ...perfil, medalhas: [...perfil.medalhas, medalhaId] };
}

export function atualizarStreak(perfil: PerfilJogador, dataUltimaSessaoIso: string | null, dataHoje: Date): PerfilJogador {
  if (!dataUltimaSessaoIso) return { ...perfil, streak: 1 };
  const dataUltima = new Date(dataUltimaSessaoIso + "T00:00:00");
  const hoje = new Date(dataHoje.toISOString().slice(0, 10) + "T00:00:00");
  const diasPassados = Math.round((hoje.getTime() - dataUltima.getTime()) / 86400000);
  if (diasPassados === 0) return perfil;
  if (diasPassados === 1) return { ...perfil, streak: perfil.streak + 1 };
  if (diasPassados === 2 && perfil.freezes_disponiveis > 0) {
    return { ...perfil, streak: perfil.streak + 1, freezes_disponiveis: perfil.freezes_disponiveis - 1 };
  }
  return { ...perfil, streak: 1 };
}

export function renovarFreezeSemanal(perfil: PerfilJogador): PerfilJogador {
  return { ...perfil, freezes_disponiveis: 1 };
}
