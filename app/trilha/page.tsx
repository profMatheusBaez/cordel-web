"use client";

import Link from "next/link";
import { useProgresso } from "@/lib/progresso";
import { licoesPorModulo, licaoDesbloqueada, NOMES_MODULO } from "@/lib/dados";

export default function Trilha() {
  const { perfil } = useProgresso();
  const modulos = licoesPorModulo();

  return (
    <main className="flex-1 px-5 pt-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="text-muted">←</Link>
        <h1 className="font-ui text-xl font-semibold">Trilha</h1>
      </div>

      <div className="space-y-8">
        {Array.from(modulos.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([modulo, licoes]) => (
            <section key={modulo}>
              <h2 className="font-mono text-xs text-muted uppercase tracking-wide mb-2">
                Módulo {modulo} · {NOMES_MODULO[modulo] ?? ""}
              </h2>
              <div className="space-y-2">
                {licoes.map((licao) => {
                  const concluida = perfil.licoes_concluidas.includes(licao.id);
                  const desbloqueada = licaoDesbloqueada(licao, perfil.licoes_concluidas);
                  const conteudo = (
                    <div
                      className={`rounded-xl border p-3 flex items-center justify-between ${
                        concluida ? "border-accent/50 bg-accent/10" : desbloqueada ? "border-border bg-panel2" : "border-border/50 bg-panel2/40 opacity-50"
                      }`}
                    >
                      <div>
                        <p className="font-ui text-sm font-medium">{licao.titulo}</p>
                        <p className="text-xs text-muted">{licao.objetivo}</p>
                      </div>
                      <span className="font-mono text-xs text-warn shrink-0 ml-2">
                        {concluida ? "✓" : desbloqueada ? `+${licao.xp}xp` : "🔒"}
                      </span>
                    </div>
                  );
                  return desbloqueada ? (
                    <Link key={licao.id} href={`/pratica/${licao.id}`}>
                      {conteudo}
                    </Link>
                  ) : (
                    <div key={licao.id}>{conteudo}</div>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </main>
  );
}
