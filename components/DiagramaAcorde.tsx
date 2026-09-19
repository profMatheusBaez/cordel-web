import { Acorde } from "@/lib/tipos";

const CORES_DEDO: Record<number, string> = {
  1: "#5ec8ff", // ciano — indicador
  2: "#f5d547", // amarelo — médio
  3: "#7cf29c", // verde — anelar
  4: "#c58bff", // roxo — mínimo
};

// Diagrama de acorde em SVG: 6 cordas (linha 6 no topo, linha 1 embaixo),
// bolinhas coloridas numeradas por dedo, O para corda solta, X para
// abafada — replica a linguagem visual fixa do PLANO-CURSO-VISUAL.md.
export function DiagramaAcorde({ acorde, casasVisiveis = 4 }: { acorde: Acorde; casasVisiveis?: number }) {
  const largura = 220;
  const altura = 260;
  const margemTopo = 40;
  const margemBase = 30;
  const margemLateral = 30;
  const alturaCordas = altura - margemTopo - margemBase;
  const passoCorda = alturaCordas / 5; // 6 cordas, 5 espaços
  const passoCasa = (largura - margemLateral * 2) / casasVisiveis;

  const yDaCorda = (corda: number) => margemTopo + (6 - corda) * passoCorda;
  const xDaCasa = (casa: number) => margemLateral + (casa - 0.5) * passoCasa;

  return (
    <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full max-w-[240px] mx-auto">
      {/* pestana (traste 0, mais grossa) */}
      <line x1={margemLateral} y1={margemTopo - 6} x2={margemLateral} y2={margemTopo + alturaCordas + 6} stroke="#8b92a5" strokeWidth={4} />
      {/* trastes verticais */}
      {Array.from({ length: casasVisiveis }).map((_, i) => (
        <line
          key={i}
          x1={margemLateral + (i + 1) * passoCasa}
          y1={margemTopo - 6}
          x2={margemLateral + (i + 1) * passoCasa}
          y2={margemTopo + alturaCordas + 6}
          className="trasto-linha"
        />
      ))}
      {/* números das casas */}
      {Array.from({ length: casasVisiveis }).map((_, i) => (
        <text key={i} x={xDaCasa(i + 1)} y={margemTopo + alturaCordas + 22} textAnchor="middle" fontSize={11} fill="#8b92a5" fontFamily="JetBrains Mono, monospace">
          {i + 1}
        </text>
      ))}
      {/* cordas horizontais */}
      {[1, 2, 3, 4, 5, 6].map((corda) => (
        <line key={corda} x1={margemLateral} y1={yDaCorda(corda)} x2={largura - margemLateral} y2={yDaCorda(corda)} className="corda-linha" />
      ))}
      {/* O / X acima da pestana, por corda */}
      {[1, 2, 3, 4, 5, 6].map((corda) => {
        if (acorde.soltas.includes(corda)) {
          return (
            <text key={corda} x={margemLateral - 14} y={yDaCorda(corda) + 4} textAnchor="middle" fontSize={13} fontFamily="JetBrains Mono, monospace" fill="#7cf29c">
              O
            </text>
          );
        }
        if (acorde.abafadas.includes(corda)) {
          return (
            <text key={corda} x={margemLateral - 14} y={yDaCorda(corda) + 4} textAnchor="middle" fontSize={13} fontFamily="JetBrains Mono, monospace" fill="#ff6b6b">
              X
            </text>
          );
        }
        return null;
      })}
      {/* dedos posicionados */}
      {acorde.posicoes.map((p, i) => (
        <g key={i}>
          <circle cx={xDaCasa(p.casa)} cy={yDaCorda(p.corda)} r={11} fill={CORES_DEDO[p.dedo] ?? "#5ec8ff"} />
          <text x={xDaCasa(p.casa)} y={yDaCorda(p.corda) + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0b0d12" fontFamily="Space Grotesk, sans-serif">
            {p.dedo}
          </text>
        </g>
      ))}
    </svg>
  );
}
