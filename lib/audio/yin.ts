// Afinador por YIN (autocorrelação normalizada) — porte direto de
// cordel/audio/afinador.py para uso no navegador (Web Audio API).

export interface LeituraAfinador {
  f0: number | null; // Hz
  midi: number | null; // nota MIDI mais próxima
  cents: number | null; // desvio em cents
  confianca: number; // 0..1
}

function diferenca(sinal: Float32Array, tauMax: number): Float64Array {
  const n = sinal.length;
  const d = new Float64Array(tauMax);
  // autocorrelação direta (janelas de afinador são curtas o bastante, ~O(n*tauMax))
  const energiaAcum = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) energiaAcum[i + 1] = energiaAcum[i] + sinal[i] * sinal[i];
  const e0 = energiaAcum[n] - energiaAcum[0];

  for (let tau = 0; tau < tauMax; tau++) {
    let acf = 0;
    for (let i = 0; i < n - tau; i++) acf += sinal[i] * sinal[i + tau];
    const eTau = tau < n ? energiaAcum[n] - energiaAcum[Math.min(tau, n)] : 0;
    d[tau] = e0 + eTau - 2 * acf;
  }
  d[0] = 0;
  return d;
}

function diferencaNormalizadaCumulativa(d: Float64Array): Float64Array {
  const cmnd = new Float64Array(d.length).fill(1);
  let soma = 0;
  for (let tau = 1; tau < d.length; tau++) {
    soma += d[tau];
    cmnd[tau] = soma > 0 ? (d[tau] * tau) / soma : 1.0;
  }
  return cmnd;
}

function interpolarParabola(cmnd: Float64Array, tau: number): number {
  if (tau <= 0 || tau >= cmnd.length - 1) return tau;
  const s0 = cmnd[tau - 1], s1 = cmnd[tau], s2 = cmnd[tau + 1];
  const denom = 2 * s1 - s2 - s0;
  if (Math.abs(denom) < 1e-12) return tau;
  const ajuste = (s2 - s0) / (2 * denom);
  return tau + ajuste;
}

export function yin(
  sinalIn: Float32Array,
  taxaAmostragem: number,
  fMin = 70.0,
  fMax = 900.0,
  limiar = 0.15
): [number | null, number] {
  const n = sinalIn.length;
  let media = 0;
  for (let i = 0; i < n; i++) media += sinalIn[i];
  media /= n;
  const sinal = new Float32Array(n);
  let maxAbs = 0;
  for (let i = 0; i < n; i++) {
    sinal[i] = sinalIn[i] - media;
    maxAbs = Math.max(maxAbs, Math.abs(sinal[i]));
  }
  if (maxAbs < 1e-6) return [null, 0];

  const tauMin = Math.max(1, Math.floor(taxaAmostragem / fMax));
  const tauMax = Math.min(n - 1, Math.floor(taxaAmostragem / fMin));
  if (tauMax <= tauMin) return [null, 0];

  const d = diferenca(sinal, tauMax + 1);
  const cmnd = diferencaNormalizadaCumulativa(d);

  let tauEscolhido: number | null = null;
  for (let tau = tauMin; tau < tauMax; tau++) {
    if (cmnd[tau] < limiar) {
      let t = tau;
      while (t + 1 < tauMax && cmnd[t + 1] < cmnd[t]) t++;
      tauEscolhido = t;
      break;
    }
  }
  if (tauEscolhido === null) {
    let melhorIdx = tauMin, melhorVal = Infinity;
    for (let tau = tauMin; tau < tauMax; tau++) {
      if (cmnd[tau] < melhorVal) { melhorVal = cmnd[tau]; melhorIdx = tau; }
    }
    tauEscolhido = melhorIdx;
  }

  const tauInterp = interpolarParabola(cmnd, tauEscolhido);
  if (tauInterp <= 0) return [null, 0];

  const f0 = taxaAmostragem / tauInterp;
  const confianca = Math.max(0, 1 - cmnd[tauEscolhido]);
  return [f0, confianca];
}

export function hzParaMidi(f0: number): number {
  return 69.0 + 12.0 * Math.log2(f0 / 440.0);
}

export function midiParaHz(midi: number): number {
  return 440.0 * Math.pow(2, (midi - 69.0) / 12.0);
}

export function analisar(sinal: Float32Array, taxaAmostragem: number, fMin = 70.0, fMax = 900.0): LeituraAfinador {
  const [f0, confianca] = yin(sinal, taxaAmostragem, fMin, fMax);
  if (f0 === null || f0 <= 0) return { f0: null, midi: null, cents: null, confianca: 0 };
  const midiFracionario = hzParaMidi(f0);
  const midiProximo = Math.round(midiFracionario);
  const cents = (midiFracionario - midiProximo) * 100.0;
  return { f0, midi: midiProximo, cents, confianca };
}
