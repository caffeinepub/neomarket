import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CheatSheet, CheatSheetInput } from "../backend.d";
import { useActor } from "./useActor";

// ─── Get All Sheets ───────────────────────────────────────────────────────────

export function useGetAllSheets() {
  const { actor, isFetching } = useActor();
  return useQuery<CheatSheet[]>({
    queryKey: ["sheets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSheets();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Add Sheet ────────────────────────────────────────────────────────────────

export function useAddSheet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sheet: CheatSheetInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addSheet(sheet);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sheets"] });
    },
  });
}

// ─── Delete Sheet ─────────────────────────────────────────────────────────────

export function useDeleteSheet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteSheet(title);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sheets"] });
    },
  });
}
