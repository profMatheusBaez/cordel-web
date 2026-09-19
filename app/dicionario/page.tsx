"use client";

import Link from "next/link";
import { useState } from "react";
import { ACORDES } from "@/lib/dados";
import { acordePorId } from "@/lib/dados";
import { DiagramaAcorde } from "@/components/DiagramaAcorde";

export default function Dicionario() {
  const ids = Object.keys(ACORDES);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const acorde = selecionado ? acordePorId(selecionado) : null;

  return (
    <main className="flex-1 px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="text-muted">←</Link>
        <h1 className="font-ui text-xl font-semibold">Dicionário de acordes</h1>
      </div>

      {acorde ? (
        <div className="rounded-2xl border border-border bg-panel p-5 flex flex-col items-center gap-3">
          <button onClick={() => setSelecionado(null)} className="self-start text-xs text-muted underline">
            ← todos os acordes
          </button>
          <span className="font-mono text-3xl font-bold">{acorde.simbolo}</span>
          <span className="text-sm text-muted">{acorde.nome}</span>
          <DiagramaAcorde acorde={acorde} />
          {acorde.dicas.map((d, i) => (
            <p key={i} className="text-xs text-muted italic text-center">{d}</p>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {ids.map((id) => (
            <button
              key={id}
              onClick={() => setSelecionado(id)}
              className="rounded-xl bg-panel2 border border-border py-3 font-mono text-sm font-semibold"
            >
              {ACORDES[id].simbolo}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
