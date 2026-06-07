import { client } from "@poker-trainer/api-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppRoutes } from "./routes";
import "./styles.css";

client.setConfig({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000",
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000 },
  },
});

const root = document.getElementById("root");
if (!root) throw new Error("root element missing");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
