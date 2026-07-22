// ═══════════════════════════════════════════════
// USE CONSCIOUSNESS STATE (Package D — Bison Core)
// React hook for reading Bison's consciousness state.
// ═══════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { loadConsciousnessState } from '@/lib/bison/consciousnessEngine';

export function useConsciousnessState() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsciousnessState().then(s => {
      setState(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const refresh = () => {
    loadConsciousnessState().then(setState).catch(() => {});
  };

  return { state, loading, refresh };
}