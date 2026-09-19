# Cordel — versão web/mobile

App Next.js (mobile-first, tema escuro) que ensina violão só com o
microfone: afinador, dicionário de acordes e trilha de lições com
detecção de acorde em tempo real no navegador. Sem visão computacional —
o app roda em qualquer celular ou computador com microfone e navegador
moderno (Chrome/Safari).

## O que foi portado do app desktop em Python

- **Afinador (YIN)**: `lib/audio/yin.ts`, porte direto de `afinador.py`.
- **Detecção de onset (strum)**: `lib/audio/onset.ts`, porte de `onset.py`.
- **Máquina de estados da tentativa**: `lib/audio/tentativa.ts`, porte de `exercicios.py`.
- **Gamificação (XP, níveis, títulos, medalhas, streak)**: `lib/gamificacao.ts`, porte de `progresso.py`.
- **Dados de acordes e lições**: `lib/dados/acordes.json` e `licoes.json`, copiados do projeto original.
- **Diagrama de acorde**: SVG gerado a partir dos mesmos dados (bolinhas coloridas por dedo, O/X), seguindo `PLANO-CURSO-VISUAL.md`.

## O que mudou de propósito (decisão de escopo desta v1 web)

O app desktop usa um **dicionário calibrado por aluno** (o aluno grava
cada nota antes de começar) + decomposição NNLS para saber exatamente
qual corda/casa soou. Isso pede uma etapa de calibração e uma biblioteca
de otimização (scipy) que não faz sentido portar para uma primeira
versão web mobile.

Esta v1 usa **chroma + template matching** (`lib/audio/chroma.ts`, o
método de "segunda opinião" do app original, `croma.py`) como método
principal: sem calibração, funciona na hora, mas só sabe dizer se o
**conjunto de notas** do acorde está certo — não aponta qual dedo/corda
especificamente errou. Para trazer o diagnóstico fino de volta (v2),
dá para portar a calibração guiada (Módulo 0: "toque cada corda solta")
e recriar a decomposição por mínimos quadrados não-negativos em JS.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do Supabase (opcional)
npm run dev
```

Abra `http://localhost:3000` no celular (mesma rede) ou no computador.
O microfone só funciona em `https://` ou `localhost` — é restrição do
navegador, não do app.

## Deploy na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em https://vercel.com, "Add New Project" → importe o repositório.
3. Framework preset: Next.js (detectado automaticamente). Não precisa mudar nada.
4. Se for usar Supabase, adicione as variáveis de ambiente abaixo em
   Project Settings → Environment Variables antes do deploy.
5. Deploy. A Vercel te dá uma URL `https://SEU-PROJETO.vercel.app` — abra
   direto no celular, e dá para "Adicionar à tela inicial" para parecer
   um app instalado (PWA simples).

## Configurando o Supabase (login + progresso na nuvem)

Sem Supabase configurado, o app funciona normalmente e guarda o
progresso só no aparelho (localStorage) — dá para usar assim
indefinidamente se você não precisar sincronizar entre celular e
computador.

Para ativar login e progresso sincronizado:

1. Crie um projeto em https://supabase.com (grátis).
2. Em SQL Editor, rode o conteúdo de `supabase/schema.sql` (cria a
   tabela `perfis` com RLS e o gatilho que cria um perfil vazio para
   cada novo usuário).
3. Em Project Settings → API, copie a "Project URL" e a chave "anon public".
4. Preencha `.env.local` (local) e as variáveis de ambiente na Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
   ```
5. Em Authentication → URL Configuration, adicione a URL do seu deploy
   Vercel (e `http://localhost:3000` para testar local) em "Redirect URLs".
6. Login é por link mágico (magic link) — sem senha, só e-mail.

## Estrutura

```
app/            rotas (App Router): trilha, prática de lição, afinador, dicionário, login
components/     DiagramaAcorde (SVG), BarraXP
lib/audio/      YIN, onset, chroma, máquina de estados, hook do microfone
lib/dados/      acordes.json, licoes.json (dados do curso)
lib/progresso.ts   progresso local + sincronização com Supabase
supabase/schema.sql   schema para copiar no SQL editor do Supabase
```

## Limitações conhecidas desta v1

- Reconhecimento de acorde por chroma (sem calibração) é menos preciso
  que o motor NNLS do app desktop — funciona bem para os acordes
  abertos dos módulos 0-3, tende a ficar mais ambíguo em acordes com
  muitas notas repetidas.
- Sem detecção de trasteio/sustain/simultaneidade (métricas de
  qualidade do desktop) — a v1 só decide certo/errado.
- Sem metrônomo sonoro ainda (a batida/BPM da lição aparece só como texto).
