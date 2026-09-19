import { xpNecessario } from "@/lib/gamificacao";

export function BarraXP({ xp, nivel }: { xp: number; nivel: number }) {
  const xpAtualNivel = xpNecessario(nivel);
  const xpProximoNivel = xpNecessario(nivel + 1);
  const faixa = Math.max(1, xpProximoNivel - xpAtualNivel);
  const progresso = Math.min(1, Math.max(0, (xp - xpAtualNivel) / faixa));

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono text-muted mb-1">
        <span>Nível {nivel}</span>
        <span>{xp} XP</span>
      </div>
      <div className="h-2 w-full rounded-full bg-panel2 overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progresso * 100}%` }} />
      </div>
    </div>
  );
}
