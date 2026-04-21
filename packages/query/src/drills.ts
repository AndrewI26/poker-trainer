import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { ApiClient } from "@poker-trainer/api-client";

import { drillKeys } from "./keys";

export function createDrillQueries(client: ApiClient) {
  return {
    drills: {
      list: (skip = 0, limit = 100) => ({
        queryKey: drillKeys.list(skip, limit),
        queryFn: async () => {
          const { data, error } = await client.GET("/api/drills", {
            params: { query: { skip, limit } },
          });
          if (error) throw error;
          return data ?? [];
        },
      }),
      detail: (id: number) => ({
        queryKey: drillKeys.detail(id),
        queryFn: async () => {
          const { data, error } = await client.GET("/api/drills/{drill_id}", {
            params: { path: { drill_id: id } },
          });
          if (error) throw error;
          return data;
        },
      }),
    },
  };
}

export function useDrills(client: ApiClient, skip = 0, limit = 100) {
  const q = createDrillQueries(client);
  return useQuery(q.drills.list(skip, limit));
}

export function useDrill(client: ApiClient, id: number) {
  const q = createDrillQueries(client);
  return useQuery({ ...q.drills.detail(id), enabled: Number.isFinite(id) });
}

export function useCreateDrill(client: ApiClient) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; description?: string | null; tags?: string | null }) => {
      const { data, error } = await client.POST("/api/drills", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: drillKeys.all });
    },
  });
}

export function useUpdateDrill(client: ApiClient, id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      name?: string | null;
      description?: string | null;
      tags?: string | null;
    }) => {
      const { data, error } = await client.PATCH("/api/drills/{drill_id}", {
        params: { path: { drill_id: id } },
        body,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: drillKeys.all });
      qc.invalidateQueries({ queryKey: drillKeys.detail(id) });
    },
  });
}

export function useDeleteDrill(client: ApiClient) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await client.DELETE("/api/drills/{drill_id}", {
        params: { path: { drill_id: id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: drillKeys.all });
    },
  });
}

/** Prefetch drills (e.g. on router load). */
export function prefetchDrills(qc: QueryClient, client: ApiClient, skip = 0, limit = 100) {
  const q = createDrillQueries(client);
  return qc.prefetchQuery(q.drills.list(skip, limit));
}
