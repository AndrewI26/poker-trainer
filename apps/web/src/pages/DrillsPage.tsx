import {
  createDrillApiDrillsPostMutation,
  deleteDrillApiDrillsDrillIdDeleteMutation,
  listDrillsApiDrillsGetOptions,
  listDrillsApiDrillsGetQueryKey,
} from "@poker-trainer/api-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export function DrillsPage() {
  const queryClient = useQueryClient();
  const {
    data: drills,
    isLoading,
    error,
  } = useQuery(listDrillsApiDrillsGetOptions());
  const createDrill = useMutation({
    ...createDrillApiDrillsPostMutation(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: listDrillsApiDrillsGetQueryKey(),
      }),
  });
  const deleteDrill = useMutation({
    ...deleteDrillApiDrillsDrillIdDeleteMutation(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: listDrillsApiDrillsGetQueryKey(),
      }),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <>
      <section className="card">
        <h2>Training Drills</h2>
        {isLoading && <p className="muted">Loading…</p>}
        {error && <p className="error">{(error as Error).message}</p>}
        <ul className="list">
          {drills?.map((d) => (
            <li key={d.id} className="list-item">
              <strong>{d.name}</strong>
              {d.description ? (
                <span className="muted"> — {d.description}</span>
              ) : null}
              <button
                type="button"
                className="btn danger"
                onClick={() => deleteDrill.mutate({ path: { drill_id: d.id } })}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Add Drill</h2>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            createDrill.mutate(
              {
                body: {
                  name: name.trim(),
                  description: description || null,
                  tags: null,
                },
              },
              {
                onSuccess: () => {
                  setName("");
                  setDescription("");
                },
              },
            );
          }}
        >
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </label>
          <button type="submit" disabled={createDrill.isPending}>
            {createDrill.isPending ? "Saving…" : "Create"}
          </button>
        </form>
      </section>
    </>
  );
}
