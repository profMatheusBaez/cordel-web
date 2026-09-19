// Detector de onset de strum por teto decadente — porte de
// cordel/audio/onset.py, adaptado para operar quadro-a-quadro em streaming
// (cada chamada recebe a energia em dB de um novo frame do AnalyserNode).

export interface ConfigOnset {
  debounceMs: number;
  taxaQuedaDbS: number;
  limiarDb: number;
  pisoDb: number;
}

export const CONFIG_ONSET_PADRAO: ConfigOnset = {
  debounceMs: 120,
  taxaQuedaDbS: 80,
  limiarDb: 8,
  pisoDb: -80,
};

export class DetectorOnset {
  private teto = -120.0;
  private ultimoPicoMs = -Infinity;
  private config: ConfigOnset;

  constructor(config: ConfigOnset = CONFIG_ONSET_PADRAO) {
    this.config = config;
  }

  reset() {
    this.teto = -120.0;
    this.ultimoPicoMs = -Infinity;
  }

  // energiaDb: energia de banda larga do frame atual, em dB.
  // agoraMs: timestamp do frame (performance.now() ou acumulado).
  // deltaMs: duração do frame anterior até este (para a queda do teto).
  processarFrame(energiaDb: number, agoraMs: number, deltaMs: number): boolean {
    const quedaFrame = this.config.taxaQuedaDbS * (deltaMs / 1000);
    let onset = false;
    if (
      energiaDb > this.teto + this.config.limiarDb &&
      energiaDb > this.config.pisoDb &&
      agoraMs - this.ultimoPicoMs >= this.config.debounceMs
    ) {
      onset = true;
      this.ultimoPicoMs = agoraMs;
    }
    this.teto = Math.max(energiaDb, this.teto - quedaFrame);
    return onset;
  }
}

export function energiaBandaLargaDb(magnitudes: Float32Array): number {
  let soma = 0;
  for (let i = 0; i < magnitudes.length; i++) soma += magnitudes[i];
  return 20 * Math.log10(soma + 1e-9);
}
