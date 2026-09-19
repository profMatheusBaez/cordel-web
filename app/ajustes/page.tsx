"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { criarClienteSupabase } from "@/lib/supabase/client";

export default function Ajustes() {
  const [email, setEmail] = useState<string | null>(null);
  const configurado = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  useEffect(() => {
    if (!configurado) return;
    const supabase = criarClienteSupabase();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [configurado]);

  async function sair() {
    const supabase = criarClienteSupabase();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="flex-1 flex flex-col px-5 pt-8 pb-8 gap-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted">←</Link>
        <h1 className="font-ui text-xl font-semibold">Conta</h1>
      </div>

      {email ? (
        <>
          <p className="text-sm text-muted">Conectado como {email}</p>
          <button onClick={sair} className="rounded-full border border-border px-5 py-3 text-sm">
            Sair
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">Você ainda não entrou com uma conta.</p>
          <Link href="/login" className="rounded-full bg-accent text-base px-5 py-3 font-ui font-semibold text-center">
            Entrar / criar conta
          </Link>
        </>
      )}
    </main>
  );
}
