import { createApiClient } from "@poker-trainer/api-client";
import {
	useCreateDrill,
	useDeleteDrill,
	useDrills,
} from "@poker-trainer/query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const apiBase = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export function HomePage() {
	const client = useMemo(() => createApiClient(apiBase), []);
	const { data: drills, isLoading, error } = useDrills(client);
	const createDrill = useCreateDrill(client);
	const deleteDrill = useDeleteDrill(client);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");

	return (
		<div className="page">
			<header className="header">
				<h1>Poker Trainer</h1>
				<p className="muted">
					Boilerplate: drills CRUD via shared React Query + openapi-fetch
					client.
				</p>
				<nav>
					<Link to="/" className="link">
						Home
					</Link>
				</nav>
			</header>

			<section className="card">
				<h2>Training drills</h2>
				{isLoading && <p>Loading…</p>}
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
								onClick={() => deleteDrill.mutate(d.id)}
							>
								Delete
							</button>
						</li>
					))}
				</ul>
			</section>

			<section className="card">
				<h2>Add drill</h2>
				<form
					className="form"
					onSubmit={(e) => {
						e.preventDefault();
						if (!name.trim()) return;
						createDrill.mutate(
							{
								name: name.trim(),
								description: description || null,
								tags: null,
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
		</div>
	);
}
