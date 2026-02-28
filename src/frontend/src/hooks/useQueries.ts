import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// ─── Watchlist ────────────────────────────────────────────────────────────────

export function useGetWatchlist() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["watchlist"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWatchlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) return;
      return actor.addToWatchlist(symbol);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useRemoveFromWatchlist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (symbol: string) => {
      if (!actor) return;
      return actor.removeFromWatchlist(symbol);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

// ─── Preferred Currency ───────────────────────────────────────────────────────

export function useGetPreferredCurrency() {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["preferredCurrency"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPreferredCurrency();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPreferredCurrency() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (currency: string) => {
      if (!actor) return;
      return actor.setPreferredCurrency(currency);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["preferredCurrency"] });
    },
  });
}
