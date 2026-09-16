import { useEffect, useRef, useState, useCallback } from 'react';

const CROSSFADE_DURATION = 2.0;
const START_VOLUME = 0.55;

interface AudioSlot {
  audio: HTMLAudioElement;
  gain: GainNode;
}

export function useAudioEngine(initialSongUrl?: string) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const slotsRef = useRef<AudioSlot[]>([]);
  const activeSlotRef = useRef(0);
  const currentUrlRef = useRef<string | null>(initialSongUrl || null);
  const isUnlockedRef = useRef(false);

  // Initialize context
  const getOrCreateContext = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.setValueAtTime(START_VOLUME, ctx.currentTime);
    master.connect(ctx.destination);

    audioCtxRef.current = ctx;
    masterGainRef.current = master;

    const slots: AudioSlot[] = [0, 1].map(() => {
      const audio = new Audio();
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';

      let source: MediaElementAudioSourceNode;
      try {
        source = ctx.createMediaElementSource(audio);
      } catch (e) {
        console.warn('[useAudioEngine] Could not create media element source:', e);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      source!.connect(gain);
      gain.connect(master);

      return { audio, gain };
    });

    slotsRef.current = slots;
    return ctx;
  }, []);

  const rampGain = useCallback((gainNode: GainNode, from: number, to: number, duration: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(from, now);
    gainNode.gain.linearRampToValueAtTime(to, now + duration);
  }, []);

  const startPlayback = useCallback((url: string) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !isUnlockedRef.current) return;

    const incoming = slotsRef.current[activeSlotRef.current];
    if (!incoming?.audio) return;

    incoming.audio.src = url;
    incoming.audio.currentTime = 0;

    const playPromise = incoming.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // File not found or blocked — fail silently
        });
    }

    rampGain(incoming.gain, 0, 1, CROSSFADE_DURATION);
  }, [rampGain]);

  const crossfadeTo = useCallback((url: string) => {
    if (!url || url === currentUrlRef.current) return;
    currentUrlRef.current = url;

    if (!isUnlockedRef.current) return;

    const outgoingIdx = activeSlotRef.current;
    const incomingIdx = (activeSlotRef.current + 1) % 2;
    activeSlotRef.current = incomingIdx;

    const outgoing = slotsRef.current[outgoingIdx];
    const incoming = slotsRef.current[incomingIdx];

    if (!incoming?.audio) return;

    incoming.audio.src = url;
    incoming.audio.currentTime = 0;

    const playPromise = incoming.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          if (outgoing.audio && !outgoing.audio.paused) {
            rampGain(outgoing.gain, outgoing.gain.gain.value, 0, CROSSFADE_DURATION);
            setTimeout(() => {
              outgoing.audio.pause();
              if (audioCtxRef.current) {
                outgoing.gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
              }
            }, CROSSFADE_DURATION * 1000);
          }
          rampGain(incoming.gain, 0, 1, CROSSFADE_DURATION);
        })
        .catch(() => {
          currentUrlRef.current = null;
        });
    }
  }, [rampGain]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (masterGainRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        masterGainRef.current.gain.cancelScheduledValues(now);
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now);
        masterGainRef.current.gain.linearRampToValueAtTime(next ? 0 : START_VOLUME, now + 0.4);
      }
      return next;
    });
  }, []);

  // Unlock on user gesture
  useEffect(() => {
    const unlock = () => {
      if (isUnlockedRef.current) return;
      const ctx = getOrCreateContext();

      const handleResume = () => {
        isUnlockedRef.current = true;
        if (currentUrlRef.current) {
          startPlayback(currentUrlRef.current);
        }
        UNLOCK_EVENTS.forEach((evt) => window.removeEventListener(evt, unlock));
      };

      if (ctx.state === 'suspended') {
        ctx.resume().then(handleResume);
      } else {
        handleResume();
      }
    };

    const UNLOCK_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'];
    UNLOCK_EVENTS.forEach((evt) => window.addEventListener(evt, unlock, { passive: true }));

    return () => {
      UNLOCK_EVENTS.forEach((evt) => window.removeEventListener(evt, unlock));
    };
  }, [getOrCreateContext, startPlayback]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      slotsRef.current.forEach((slot) => {
        try {
          slot.audio.pause();
          slot.audio.src = '';
        } catch {
          // ignore
        }
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { isMuted, isPlaying, toggleMute, crossfadeTo };
}

