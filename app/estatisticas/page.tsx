"use client";

import Link from "next/link";
import { useProgresso } from "@/lib/progresso";
import { LICOES } from "@/lib/dados";
import { MEDALHAS } from "@/lib/gamificacao";

export default function Estatisticas() {
  const { perfil } = useProgresso();
  const totalLicoes = LICOES.length;

  return (
    <main className="flex-1 px-5 pt-8 pb-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted">←</Link>
        <h1 className="font-ui text-xl font-semibold">Estatísticas</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-panel2 border border-border p-4 text-center">
          <p className="font-mono text-2xl font-bold">{perfil.licoes_concluidas.length}/{totalLicoes}</p>
          <p className="text-xs text-muted">lições concluídas</p>
        </div>
        <div className="rounded-xl bg-panel2 border border-border p-4 text-center">
          <p className="font-mono text-2xl font-bold">{perfil.streak}</p>
          <p className="text-xs text-muted">dias seguidos</p>
        </div>
      </div>

      <section>
        <h2 className="font-mono text-xs text-muted uppercase tracking-wide mb-2">Medalhas</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(MEDALHAS).map(([id, nome]) => {
            const conquistada = perfil.medalhas.includes(id);
            return (
              <div key={id} className={`rounded-xl border p-3 text-sm ${conquistada ? "border-warn/50 bg-warn/10" : "border-border/50 opacity-40"}`}>
                {nome}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
