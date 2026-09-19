// Máquina de estados de uma tentativa — porte direto de
// cordel/motor/exercicios.py (versão apenas-áudio).
//
// ESPERANDO --(aluno toca "Pronto")--> PRONTO   [cronômetro de resposta começa]
// PRONTO    --(onset de áudio)--> ANALISANDO
// ANALISANDO --(560ms)--> VEREDITO --> APROVADO | CORRIGINDO
// CORRIGINDO --(nova tentativa)--> ESPERANDO

export type EstadoTentativa = "ESPERANDO" | "PRONTO" | "ANALISANDO" | "VEREDITO" | "APROVADO" | "CORRIGINDO";

export class MaquinaEstadoTentativa {
  janelaAnaliseMs: number;
  estado: EstadoTentativa = "ESPERANDO";
  private tsPronto: number | null = null;
  private tsInicioAnalise: number | null = null;
  tempoRespostaMs: number | null = null;

  constructor(janelaAnaliseMs = 560) {
    this.janelaAnaliseMs = janelaAnaliseMs;
  }

  alunoPronto(agoraMs: number) {
    if (this.estado !== "ESPERANDO") return;
    this.estado = "PRONTO";
    this.tsPronto = agoraMs;
  }

  onsetDetectado(agoraMs: number) {
    if (this.estado !== "PRONTO") return;
    this.estado = "ANALISANDO";
    this.tsInicioAnalise = agoraMs;
    if (this.tsPronto !== null) this.tempoRespostaMs = agoraMs - this.tsPronto;
  }

  tempoPassou(agoraMs: number) {
    if (this.estado !== "ANALISANDO" || this.tsInicioAnalise === null) return;
    if (agoraMs - this.tsInicioAnalise >= this.janelaAnaliseMs) this.estado = "VEREDITO";
  }

  aplicarVeredito(acertou: boolean) {
    if (this.estado !== "VEREDITO") return;
    this.estado = acertou ? "APROVADO" : "CORRIGINDO";
  }

  novaTentativa(agoraMs: number) {
    if (this.estado !== "CORRIGINDO") return;
    this.estado = "ESPERANDO";
    this.tsPronto = null;
    this.tsInicioAnalise = null;
    this.tempoRespostaMs = null;
  }
}
