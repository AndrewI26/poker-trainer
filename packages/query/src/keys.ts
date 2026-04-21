export const drillKeys = {
  all: ["drills"] as const,
  list: (skip?: number, limit?: number) => [...drillKeys.all, "list", { skip, limit }] as const,
  detail: (id: number) => [...drillKeys.all, "detail", id] as const,
};
