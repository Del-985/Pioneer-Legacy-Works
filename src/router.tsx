import { Navigate, createBrowserRouter, useLocation } from "react-router-dom";

import { adminRoutes } from "./admin/routes";
import { outdoorServicesRoutes } from "./divisions/outdoor-services";
import { websiteRoutes } from "./website/routes";

const adminOnlyBuild = import.meta.env.MODE === "admin";

function LegacyLandscapingRedirect() {
  const location = useLocation();
  const legacyPrefix = "/landscaping";
  const suffix = location.pathname.startsWith(legacyPrefix)
    ? location.pathname.slice(legacyPrefix.length)
    : "";
  const destination = `/outdoor-services${suffix || ""}${location.search}${location.hash}`;

  return <Navigate to={destination} replace />;
}

const routes = adminOnlyBuild
  ? [
      { path: "/", element: <Navigate to="/admin" replace /> },
      ...adminRoutes,
      { path: "*", element: <Navigate to="/admin" replace /> }
    ]
  : [
      ...websiteRoutes,
      ...outdoorServicesRoutes,
      { path: "/landscaping/*", element: <LegacyLandscapingRedirect /> },
      ...adminRoutes
    ];

export const router = createBrowserRouter(routes);
