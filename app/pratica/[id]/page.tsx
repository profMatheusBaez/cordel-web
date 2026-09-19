"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { licaoPorId, acordePorId } from "@/lib/dados";
import { pitchClassesDoAcorde } from "@/lib/tipos";
import { useMicrofone } from "@/lib/audio/useMicrofone";
import { useProgresso } from "@/lib/progresso";
import { DiagramaAcorde } from "@/components/DiagramaAcorde";

const LIMIAR_ACERTO = 0.72;

type Veredito = "ouvindo" | "certo" | "errado" | null;

export default function Pratica() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const licao = licaoPorId(params.id);
  const { concluirLicao } = useProgresso();

  const sequencia = useMemo(() => {
    if (!licao) return [];
    const repeticoes = licao.repeticoes ?? 1;
    const seq: string[] = [];
    for (let r = 0; r < repeticoes; r++) seq.push(...licao.acordes);
    return seq;
  }, [licao]);

  const [indice, setIndice] = useState(0);
  const [veredito, setVeredito] = useState<Veredito>("ouvindo");
  const [concluida, setConcluida] = useState(false);
  const acertosRef = useRef(0);
  const bloqueadoRef = useRef(false);

  const acordeAtualId = sequencia[indice];
  const acorde = acordeAtualId ? acordePorId(acordeAtualId) : null;
  const proximoAcorde = sequencia[indice + 1] ? acordePorId(sequencia[indice + 1]) : null;
  const pitchClassesAlvo = useMemo(() => (acorde ? pitchClassesDoAcorde(acorde) : []), [acorde]);

  const { estado, iniciar, parar } = useMicrofone({
    pitchClassesAlvo,
    onOnset: (similaridade) => {
      if (bloqueadoRef.current || concluida) return;
      bloqueadoRef.current = true;
      const acertou = similaridade >= LIMIAR_ACERTO;
      setVeredito(acertou ? "certo" : "errado");
      if (acertou) acertosRef.current += 1;
      setTimeout(() => {
        if (acertou) {
          setIndice((i) => {
            const proximo = i + 1;
            if (proximo >= sequencia.length) {
              setConcluida(true);
              if (licao) concluirLicao(licao.id, licao.xp);
            }
            return proximo;
          });
        }
        setVeredito("ouvindo");
        bloqueadoRef.current = false;
      }, acertou ? 900 : 1500);
    },
  });

  useEffect(() => {
    iniciar();
    return () => parar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licao?.id]);

  if (!licao) {
    return (
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <p>Lição não encontrada. <Link href="/trilha" className="underline">Voltar à trilha</Link></p>
      </main>
    );
  }

  if (concluida) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <span className="text-5xl">🎉</span>
        <h1 className="font-ui text-xl font-semibold">Lição concluída!</h1>
        <p className="text-muted">+{licao.xp} XP</p>
        <Link href="/trilha" className="mt-4 rounded-full bg-accent text-base px-6 py-3 font-ui font-semibold">
          Voltar à trilha
        </Link>
      </main>
    );
  }

  if (!acorde) {
    return <main className="flex-1 flex items-center justify-center">Carregando…</main>;
  }

  return (
    <main className="flex-1 flex flex-col px-5 pt-6 pb-8 gap-4">
      <div className="flex items-center justify-between">
        <Link href="/trilha" className="text-muted">←</Link>
        <span className="font-mono text-xs text-muted">
          {indice + 1} / {sequencia.length}
        </span>
      </div>

      <div>
        <h1 className="font-ui text-lg font-semibold">{licao.titulo}</h1>
        <p className="text-sm text-muted">{licao.objetivo}</p>
      </div>

      <div
        className={`rounded-2xl border p-5 flex flex-col items-center gap-3 transition-colors ${
          veredito === "certo" ? "border-accent bg-accent/10" : veredito === "errado" ? "border-danger bg-danger/10" : "border-border bg-panel"
        }`}
      >
        <span className="font-mono text-3xl font-bold">{acorde.simbolo}</span>
        <span className="text-sm text-muted">{acorde.nome}</span>
        <DiagramaAcorde acorde={acorde} />
        <ul className="text-sm text-center text-muted space-y-1">
          {acorde.posicoes.map((p, i) => (
            <li key={i}>
              Dedo {p.dedo} · corda {p.corda} · casa {p.casa}
            </li>
          ))}
        </ul>
        {acorde.dicas?.[0] && <p className="text-xs text-muted italic text-center">{acorde.dicas[0]}</p>}
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
        <span>batida: {licao.batida ?? "livre"} · {licao.bpm ?? 60} bpm</span>
        {proximoAcorde && <span>próximo: {proximoAcorde.simbolo}</span>}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {estado.erro && <p className="text-danger text-sm text-center">{estado.erro}</p>}
        {!estado.erro && (
          <>
            <div className={`h-3 w-3 rounded-full ${estado.ativo ? "bg-accent animate-pulse" : "bg-muted"}`} />
            <p className="text-xs text-muted font-mono">
              {veredito === "certo" ? "Acertou! ✓" : veredito === "errado" ? "Ainda não — tente de novo" : estado.ativo ? "ouvindo…" : "ligando microfone…"}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
