import { createRootRoute } from "@tanstack/react-router";

import { HomePage } from "./pages/HomePage";

const rootRoute = createRootRoute({
  component: HomePage,
});

export const routeTree = rootRoute;
