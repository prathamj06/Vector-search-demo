'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, DomainType } from './types';
import { DOMAIN_CONFIGS } from './domains';

const STORAGE_KEY = 'vsd-corpus-v1';

interface StoredCorpus {
  domain: DomainType;
  documents: Document[];
}

/**
 * Custom hook that manages the document corpus with localStorage persistence.
 * Safe for SSR — all localStorage access is guarded by useEffect.
 */
export function useDocumentStore(activeDomain: DomainType) {
  const defaultDocs = DOMAIN_CONFIGS[activeDomain].defaultDocs;

  const [documents, setDocumentsRaw] = useState<Document[]>(defaultDocs);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored: StoredCorpus = JSON.parse(raw);
        // Only restore if domain matches — otherwise use defaults
        if (stored.domain === activeDomain && Array.isArray(stored.documents)) {
          setDocumentsRaw(stored.documents);
        }
      }
    } catch {
      // Corrupt storage — silently fall back to defaults
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  // When domain switches, load that domain's defaults (and persist the switch)
  useEffect(() => {
    if (!hydrated) return;
    const config = DOMAIN_CONFIGS[activeDomain];
    setDocumentsRaw(config.defaultDocs);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ domain: activeDomain, documents: config.defaultDocs })
      );
    } catch { /* quota exceeded, ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDomain]);

  // Wrap setDocuments to auto-persist on every change
  const setDocuments: React.Dispatch<React.SetStateAction<Document[]>> = useCallback(
    (action) => {
      setDocumentsRaw((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ domain: activeDomain, documents: next })
          );
        } catch { /* quota exceeded, ignore */ }
        return next;
      });
    },
    [activeDomain]
  );

  const resetToDefaults = useCallback(() => {
    const defaults = DOMAIN_CONFIGS[activeDomain].defaultDocs;
    setDocumentsRaw(defaults);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ domain: activeDomain, documents: defaults })
      );
    } catch { /* quota exceeded, ignore */ }
  }, [activeDomain]);

  return { documents, setDocuments, resetToDefaults, hydrated };
}
