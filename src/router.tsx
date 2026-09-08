import { Navigate, createBrowserRouter } from "react-router-dom";

import { adminRoutes } from "./admin/routes";
import { landscapingRoutes } from "./divisions/landscaping";
import { websiteRoutes } from "./website/routes";

const adminOnlyBuild = import.meta.env.MODE === "admin";

const routes = adminOnlyBuild
  ? [
      { path: "/", element: <Navigate to="/admin" replace /> },
      ...adminRoutes,
      { path: "*", element: <Navigate to="/admin" replace /> }
    ]
  : [...websiteRoutes, ...landscapingRoutes, ...adminRoutes];

export const router = createBrowserRouter(routes);
