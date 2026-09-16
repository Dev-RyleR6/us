import { useState, useEffect } from 'react';

const ANNIVERSARY = new Date(2026, 5, 14); // June 14, 2026 (Month is 0-indexed: 5 = June)

export interface HeartbeatState {
  timecode: string;
  daysString: string;
  subString: string;
}

export function useHeartbeatTimer(): HeartbeatState {
  const [state, setState] = useState<HeartbeatState>(() => computeTime());

  function computeTime(): HeartbeatState {
    const now = new Date();
    const diff = Math.max(0, now.getTime() - ANNIVERSARY.getTime());

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');

    return {
      timecode: `${String(d).padStart(3, '0')}:${pad(h)}:${pad(m)}:${pad(s)}`,
      daysString: `${d} DAYS`,
      subString: `${pad(h)}h ${pad(m)}m ${pad(s)}s`,
    };
  }

  useEffect(() => {
    setState(computeTime());
    const interval = setInterval(() => {
      setState(computeTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return state;
}

