import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GeminiConfigService from '../services/GeminiConfigService';
import type { GeminiConfigDB } from '../types';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '../config';

const geminiConfigQueryKey = () => ['geminiConfig', 'default'] as const;

export const useGeminiConfig = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = GeminiConfigService.subscribeToGeminiConfig(
      (config: GeminiConfigDB) => {
        queryClient.setQueryData(geminiConfigQueryKey(), config);
      }
    );

    return unsubscribe;
  }, [queryClient]);

  return useQuery<GeminiConfigDB | null>({
    queryKey: geminiConfigQueryKey(),
    queryFn: async () => {
      const docRef = doc(
        collection(db, GeminiConfigService.COLLECTION_NAME),
        GeminiConfigService.DOC_ID
      );
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return (snap.data() || {}) as GeminiConfigDB;
      }
      return null;
    },
    // keep enabled so subscription + initial fetch run
    enabled: true,
  });
};