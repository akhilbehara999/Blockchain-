import { useState, useEffect, useRef } from 'react';
import { sha256 } from '../engine/hash';

export function useHash(input: string) {
  const [hash, setHash] = useState(() => sha256(input));
  const [previousHash, setPreviousHash] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPreviousHash(hash);
    setHash(sha256(input));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return { hash, previousHash };
}
