'use client';
import { useEffect, useRef } from 'react';
import { logMissingChordVisit } from '@/app/chord/actions';

interface Props {
  qualitySymbol: string;
  qualityFullName: string;
  intervals: number[];
}

export function LogMissingChordVisit({
  qualitySymbol,
  qualityFullName,
  intervals,
}: Props) {
  const logged = useRef(false);

  useEffect(() => {
    if (logged.current) return;
    logged.current = true;
    logMissingChordVisit(qualitySymbol, qualityFullName, intervals);
  }, [qualitySymbol, qualityFullName, intervals]);

  return null;
}
