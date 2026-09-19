"use client";

import { useCallback, useEffect, useState } from "react";
import { criarClienteSupabase } from "./supabase/client";
import { PerfilJogador, perfilInicial } from "./tipos";
import { aplicarXp, atualizarStreak } from "./gamificacao";

const CHAVE_LOCAL = "cordel:perfil";

function carregarLocal(): PerfilJogador {
  if (typeof window === "undefined") return perfilInicial();
  try {
    const bruto = window.localStorage.getItem(CHAVE_LOCAL);
    return bruto ? { ...perfilInicial(), ...JSON.parse(bruto) } : perfilInicial();
  } catch {
    return perfilInicial();
  }
}

function salvarLocal(perfil: PerfilJogador) {
  try {
    window.localStorage.setItem(CHAVE_LOCAL, JSON.stringify(perfil));
  } catch {
    // localStorage indisponível — segue só em memória
  }
}

function paraLinha(userId: string, perfil: PerfilJogador) {
  return {
    user_id: userId,
    xp: perfil.xp,
    nivel: perfil.nivel,
    streak: perfil.streak,
    freezes_disponiveis: perfil.freezes_disponiveis,
    medalhas: perfil.medalhas,
    titulo_atual: perfil.titulo_atual,
    ultima_sessao: perfil.ultima_sessao,
    licoes_concluidas: perfil.licoes_concluidas,
    atualizado_em: new Date().toISOString(),
  };
}

function daLinha(linha: Record<string, unknown>): PerfilJogador {
  return {
    xp: Number(linha.xp ?? 0),
    nivel: Number(linha.nivel ?? 1),
    streak: Number(linha.streak ?? 0),
    freezes_disponiveis: Number(linha.freezes_disponiveis ?? 1),
    medalhas: (linha.medalhas as string[]) ?? [],
    titulo_atual: String(linha.titulo_atual ?? "Curioso das Cordas"),
    ultima_sessao: (linha.ultima_sessao as string) ?? null,
    licoes_concluidas: (linha.licoes_concluidas as string[]) ?? [],
  };
}

// Progresso funciona sem login (localStorage) e sincroniza com o Supabase
// assim que o aluno cria conta — assim o app continua útil offline/sem
// configurar Supabase, e ganha nuvem quando o usuário quiser.
export function useProgresso() {
  const [perfil, setPerfil] = useState<PerfilJogador>(perfilInicial());
  const [userId, setUserId] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const supabaseConfigurado = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const local = carregarLocal();
      if (!supabaseConfigurado) {
        if (ativo) { setPerfil(local); setCarregando(false); }
        return;
      }
      const supabase = criarClienteSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (ativo) { setPerfil(local); setCarregando(false); }
        return;
      }
      setUserId(session.user.id);
      const { data } = await supabase.from("perfis").select("*").eq("user_id", session.user.id).maybeSingle();
      if (ativo) {
        setPerfil(data ? daLinha(data) : local);
        setCarregando(false);
      }
    }
    carregar();
    return () => { ativo = false; };
  }, [supabaseConfigurado]);

  const persistir = useCallback(async (novoPerfil: PerfilJogador) => {
    setPerfil(novoPerfil);
    salvarLocal(novoPerfil);
    if (supabaseConfigurado && userId) {
      const supabase = criarClienteSupabase();
      await supabase.from("perfis").upsert(paraLinha(userId, novoPerfil));
    }
  }, [supabaseConfigurado, userId]);

  const ganharXp = useCallback((xp: number) => {
    persistir(aplicarXp(perfil, xp));
  }, [perfil, persistir]);

  const concluirLicao = useCallback((licaoId: string, xp: number) => {
    if (perfil.licoes_concluidas.includes(licaoId)) return;
    const hoje = new Date();
    let atualizado = aplicarXp(perfil, xp);
    atualizado = atualizarStreak(atualizado, atualizado.ultima_sessao, hoje);
    atualizado = { ...atualizado, ultima_sessao: hoje.toISOString().slice(0, 10), licoes_concluidas: [...atualizado.licoes_concluidas, licaoId] };
    persistir(atualizado);
  }, [perfil, persistir]);

  return { perfil, carregando, userId, ganharXp, concluirLicao, supabaseConfigurado };
}
