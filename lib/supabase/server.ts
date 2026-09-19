import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function criarClienteSupabaseServidor() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // chamado de um Server Component sem permissão de escrita — ok,
            // o middleware cuida da renovação de sessão.
          }
        },
        remove(name: string, options: Record<string, unknown>) {
          try {
            cookieStore.set(name, "", options);
          } catch {
            // idem acima
          }
        },
      },
    }
  );
}
