import { Route, Routes } from "react-router";

import { Layout } from "./components/Layout";
import { DrillsPage } from "./pages/DrillsPage";
import { LandingPage } from "./pages/LandingPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="drills" element={<DrillsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
