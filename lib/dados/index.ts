import acordesRaw from "./acordes.json";
import licoesRaw from "./licoes.json";
import { Acorde, Licao } from "../tipos";

export const ACORDES = acordesRaw as unknown as Record<string, Omit<Acorde, "id">>;
export const LICOES = licoesRaw as unknown as Licao[];

export function acordePorId(id: string): Acorde | null {
  const dado = ACORDES[id];
  if (!dado) return null;
  return { id, ...dado };
}

export function licaoPorId(id: string): Licao | undefined {
  return LICOES.find((l) => l.id === id);
}

export function licoesPorModulo(): Map<number, Licao[]> {
  const mapa = new Map<number, Licao[]>();
  for (const l of LICOES) {
    if (!mapa.has(l.modulo)) mapa.set(l.modulo, []);
    mapa.get(l.modulo)!.push(l);
  }
  return mapa;
}

export function licaoDesbloqueada(licao: Licao, concluidas: string[]): boolean {
  return licao.pre_requisitos.every((id) => concluidas.includes(id));
}

export function proximaLicao(concluidas: string[]): Licao | null {
  for (const l of LICOES) {
    if (!concluidas.includes(l.id) && licaoDesbloqueada(l, concluidas)) return l;
  }
  return null;
}

export const NOMES_MODULO: Record<number, string> = {
  0: "Primeiros acordes",
  1: "Menores e maiores",
  2: "Acordes essenciais",
  3: "Destravar os dedos",
  4: "Batidas",
  5: "Progressões",
  6: "Novas sonoridades",
  7: "Pestanas",
  8: "Autonomia",
};
