"use client";

import Link from "next/link";
import { useProgresso } from "@/lib/progresso";
import { BarraXP } from "@/components/BarraXP";
import { proximaLicao } from "@/lib/dados";

export default function Home() {
  const { perfil, carregando, userId, supabaseConfigurado } = useProgresso();
  const proxima = proximaLicao(perfil.licoes_concluidas);

  return (
    <main className="flex-1 flex flex-col px-5 pt-8 pb-24 gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-ui text-2xl font-semibold">Cordel</h1>
          <p className="text-sm text-muted">{perfil.titulo_atual}</p>
        </div>
        <Link href={userId ? "/ajustes" : "/login"} className="text-xs font-mono px-3 py-2 rounded-full border border-border text-muted">
          {userId ? "conta" : "entrar"}
        </Link>
      </header>

      {!carregando && (
        <div className="rounded-2xl bg-panel border border-border p-4 space-y-3">
          <BarraXP xp={perfil.xp} nivel={perfil.nivel} />
          <div className="flex gap-4 text-sm">
            <span className="font-mono text-accent2">🔥 {perfil.streak} dias</span>
            <span className="font-mono text-warn">{perfil.medalhas.length} medalhas</span>
          </div>
          {!supabaseConfigurado && (
            <p className="text-xs text-muted">Progresso salvo neste dispositivo. Configure o Supabase para sincronizar entre celular e computador.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link href="/afinador" className="rounded-2xl bg-panel2 border border-border p-4 flex flex-col gap-1">
          <span className="text-2xl">🎼</span>
          <span className="font-ui font-medium">Afinador</span>
          <span className="text-xs text-muted">use o microfone</span>
        </Link>
        <Link href="/dicionario" className="rounded-2xl bg-panel2 border border-border p-4 flex flex-col gap-1">
          <span className="text-2xl">📖</span>
          <span className="font-ui font-medium">Dicionário</span>
          <span className="text-xs text-muted">todos os acordes</span>
        </Link>
      </div>

      <Link
        href={proxima ? `/pratica/${proxima.id}` : "/trilha"}
        className="rounded-2xl bg-accent text-base px-5 py-4 font-ui font-semibold text-center"
      >
        {proxima ? `Continuar · ${proxima.titulo}` : "Ver trilha completa"}
      </Link>

      <Link href="/trilha" className="text-center text-sm text-muted underline underline-offset-4">
        Ver todos os módulos
      </Link>
    </main>
  );
}
