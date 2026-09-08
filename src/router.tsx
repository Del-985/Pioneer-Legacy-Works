import { useEffect } from "react";
import { Navigate, createBrowserRouter, useLocation } from "react-router-dom";

import { adminRoutes } from "./admin/routes";
import { websiteRoutes } from "./website/routes";

const adminOnlyBuild = import.meta.env.MODE === "admin";
const outdoorServicesDomain = "https://pioneeroutdoorservices.com";

interface OutdoorServicesRedirectProps {
  sourcePrefix: string;
}

function OutdoorServicesRedirect({ sourcePrefix }: OutdoorServicesRedirectProps) {
  const location = useLocation();
  const suffix = location.pathname.startsWith(sourcePrefix)
    ? location.pathname.slice(sourcePrefix.length)
    : "";

  useEffect(() => {
    const destination = `${outdoorServicesDomain}${suffix || "/"}${location.search}${location.hash}`;
    window.location.replace(destination);
  }, [location.hash, location.search, suffix]);

  return null;
}

const routes = adminOnlyBuild
  ? [
      { path: "/", element: <Navigate to="/admin" replace /> },
      ...adminRoutes,
      { path: "*", element: <Navigate to="/admin" replace /> }
    ]
  : [
      ...websiteRoutes,
      {
        path: "/landscaping",
        element: <OutdoorServicesRedirect sourcePrefix="/landscaping" />
      },
      {
        path: "/landscaping/*",
        element: <OutdoorServicesRedirect sourcePrefix="/landscaping" />
      },
      {
        path: "/outdoor-services",
        element: <OutdoorServicesRedirect sourcePrefix="/outdoor-services" />
      },
      {
        path: "/outdoor-services/*",
        element: <OutdoorServicesRedirect sourcePrefix="/outdoor-services" />
      },
      ...adminRoutes
    ];

export const router = createBrowserRouter(routes);
