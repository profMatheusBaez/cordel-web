"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useMicrofone } from "@/lib/audio/useMicrofone";
import { nomePitchClass, pitchClass } from "@/lib/tipos";

const CORDAS_REFERENCIA = [
  { corda: 6, nome: "6ª · Mi grave", midi: 40 },
  { corda: 5, nome: "5ª · Lá", midi: 45 },
  { corda: 4, nome: "4ª · Ré", midi: 50 },
  { corda: 3, nome: "3ª · Sol", midi: 55 },
  { corda: 2, nome: "2ª · Si", midi: 59 },
  { corda: 1, nome: "1ª · Mi agudo", midi: 64 },
];

export default function Afinador() {
  const { estado, leituraAfinador, iniciar, parar } = useMicrofone();

  useEffect(() => {
    iniciar();
    return () => parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cents = leituraAfinador.cents ?? 0;
  const afinado = leituraAfinador.midi !== null && Math.abs(cents) <= 6;
  const cordaMaisProxima = leituraAfinador.midi
    ? CORDAS_REFERENCIA.reduce((melhor, c) => (Math.abs(c.midi - leituraAfinador.midi!) < Math.abs(melhor.midi - leituraAfinador.midi!) ? c : melhor))
    : null;

  return (
    <main className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted">←</Link>
        <h1 className="font-ui text-xl font-semibold">Afinador</h1>
      </div>

      {estado.erro && <p className="text-danger text-sm text-center">{estado.erro}</p>}

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="font-mono text-6xl font-bold">
          {leituraAfinador.midi !== null ? nomePitchClass(pitchClass(leituraAfinador.midi)) : "—"}
        </div>
        <div className="text-sm text-muted font-mono">
          {leituraAfinador.f0 ? `${leituraAfinador.f0.toFixed(1)} Hz` : "toque uma corda"}
        </div>

        {/* medidor de cents */}
        <div className="w-full max-w-xs">
          <div className="relative h-3 rounded-full bg-panel2 overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
            <div
              className={`absolute top-0 h-full w-2 rounded-full transition-all ${afinado ? "bg-accent" : "bg-warn"}`}
              style={{ left: `calc(${50 + Math.max(-50, Math.min(50, cents / 1)) * 0.5}% - 4px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
            <span>-50¢</span>
            <span>0</span>
            <span>+50¢</span>
          </div>
        </div>

        {leituraAfinador.midi !== null && (
          <p className={`font-mono text-sm ${afinado ? "text-accent" : "text-warn"}`}>
            {afinado ? "Afinado ✓" : cents > 0 ? "Um pouco agudo — afrouxe" : "Um pouco grave — aperte"}
          </p>
        )}

        {cordaMaisProxima && (
          <p className="text-xs text-muted">Corda de referência mais próxima: {cordaMaisProxima.nome}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {CORDAS_REFERENCIA.map((c) => (
          <div key={c.corda} className="rounded-xl bg-panel2 border border-border py-2">
            <p className="font-mono text-sm font-bold">{c.nome.split("·")[0]}</p>
            <p className="text-[10px] text-muted">{c.nome.split("·")[1]}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
