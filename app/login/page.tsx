"use client";

import { useState } from "react";
import Link from "next/link";
import { criarClienteSupabase } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const configurado = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  async function enviarLink(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const supabase = criarClienteSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErro(error.message);
    else setEnviado(true);
  }

  return (
    <main className="flex-1 flex flex-col px-5 pt-8 pb-8 gap-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted">←</Link>
        <h1 className="font-ui text-xl font-semibold">Entrar</h1>
      </div>

      {!configurado && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-xl p-3">
          Login por conta ainda não está configurado neste app (faltam as chaves do Supabase). Seu progresso continua salvo neste dispositivo.
        </p>
      )}

      {configurado && !enviado && (
        <form onSubmit={enviarLink} className="flex flex-col gap-3">
          <p className="text-sm text-muted">Receba um link mágico por e-mail para sincronizar seu progresso entre celular e computador.</p>
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl bg-panel2 border border-border px-4 py-3 text-sm outline-none focus:border-accent2"
          />
          <button type="submit" className="rounded-full bg-accent text-base px-5 py-3 font-ui font-semibold">
            Enviar link de acesso
          </button>
          {erro && <p className="text-danger text-sm">{erro}</p>}
        </form>
      )}

      {enviado && <p className="text-accent text-sm">Link enviado! Confira seu e-mail para entrar.</p>}
    </main>
  );
}
