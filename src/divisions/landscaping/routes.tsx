import { Navigate, type RouteObject } from "react-router-dom";

import Landscaping from "./Landscaping";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ResetPassword from "./auth/ResetPassword";
import VerifyEmail from "./auth/VerifyEmail";
import LandscapingLayout from "./layout/LandscapingLayout";
import Contact from "./pages/Contact";
import CustomerAccount from "./pages/CustomerAccount";
import Gallery from "./pages/Gallery";
import QuoteRequest from "./pages/QuoteRequest";
import ServiceRequest from "./pages/ServiceRequest";
import Services from "./pages/Services";
import { ROUTES } from "../../shared/constants/routes";

export const landscapingRoutes: RouteObject[] = [
  {
    path: ROUTES.divisions.landscaping.root,
    element: <LandscapingLayout />,
    children: [
      { index: true, element: <Landscaping /> },
      { path: "services", element: <Services /> },
      { path: "gallery", element: <Gallery /> },
      { path: "quote", element: <QuoteRequest /> },
      { path: "request", element: <ServiceRequest /> },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "account", element: <CustomerAccount /> }
    ]
  },
  {
    path: "/landscaping/*",
    element: <Navigate to={ROUTES.divisions.landscaping.root} replace />
  }
];
