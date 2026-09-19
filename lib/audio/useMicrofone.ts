"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DetectorOnset, energiaBandaLargaDb } from "./onset";
import { chromaDoEspectro, similaridadeComAlvo } from "./chroma";
import { analisar, LeituraAfinador } from "./yin";

export interface EstadoMicrofone {
  ativo: boolean;
  erro: string | null;
  nivelDb: number;
}

interface Opcoes {
  // chamado a cada onset detectado, com a similaridade de chroma contra o
  // acorde alvo (0..1) medida logo após o ataque.
  onOnset?: (similaridade: number) => void;
  pitchClassesAlvo?: number[];
}

// Hook único que abre o microfone e roda, por frame de áudio: detecção de
// onset (onset.ts), chroma para casar com o acorde alvo (chroma.ts) e YIN
// para o afinador (yin.ts). Mantém tudo num só getUserMedia/AudioContext.
export function useMicrofone(opcoes: Opcoes = {}) {
  const [estado, setEstado] = useState<EstadoMicrofone>({ ativo: false, erro: null, nivelDb: -100 });
  const [leituraAfinador, setLeituraAfinador] = useState<LeituraAfinador>({ f0: null, midi: null, cents: null, confianca: 0 });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const detectorOnsetRef = useRef(new DetectorOnset());
  const ultimoFrameMsRef = useRef<number>(performance.now());
  const opcoesRef = useRef(opcoes);
  opcoesRef.current = opcoes;

  const parar = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    setEstado((s) => ({ ...s, ativo: false }));
  }, []);

  const iniciar = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextCtor();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyserRef.current = analyser;
      detectorOnsetRef.current.reset();
      ultimoFrameMsRef.current = performance.now();
      setEstado({ ativo: true, erro: null, nivelDb: -100 });

      const freqData = new Float32Array(analyser.frequencyBinCount);
      const timeData = new Float32Array(analyser.fftSize);

      const loop = () => {
        const analyserAtual = analyserRef.current;
        const ctxAtual = audioCtxRef.current;
        if (!analyserAtual || !ctxAtual) return;

        analyserAtual.getFloatFrequencyData(freqData); // dBFS por bin
        analyserAtual.getFloatTimeDomainData(timeData);

        // energia de banda larga em "dB" comparável ao onset.py: soma de
        // magnitude linear, não dBFS por bin — reconvertendo aqui.
        const magnitudes = new Float32Array(freqData.length);
        for (let i = 0; i < freqData.length; i++) magnitudes[i] = Math.pow(10, freqData[i] / 20);
        const nivelDb = energiaBandaLargaDb(magnitudes);

        const agora = performance.now();
        const delta = agora - ultimoFrameMsRef.current;
        ultimoFrameMsRef.current = agora;
        const onset = detectorOnsetRef.current.processarFrame(nivelDb, agora, delta);

        setEstado((s) => (Math.abs(s.nivelDb - nivelDb) > 0.5 ? { ...s, nivelDb } : s));

        if (onset && opcoesRef.current.onOnset) {
          const chromaVec = chromaDoEspectro(magnitudes, ctxAtual.sampleRate, analyserAtual.fftSize);
          const alvo = opcoesRef.current.pitchClassesAlvo ?? [];
          const sim = alvo.length ? similaridadeComAlvo(chromaVec, alvo) : 0;
          opcoesRef.current.onOnset(sim);
        }

        // afinador: só quando há sinal razoável, para não gastar CPU à toa
        if (nivelDb > -55) {
          const leitura = analisar(timeData, ctxAtual.sampleRate);
          setLeituraAfinador(leitura);
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      setEstado({ ativo: false, erro: e instanceof Error ? e.message : "Não foi possível acessar o microfone.", nivelDb: -100 });
    }
  }, []);

  useEffect(() => () => parar(), [parar]);

  return { estado, leituraAfinador, iniciar, parar };
}
