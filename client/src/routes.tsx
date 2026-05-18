import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/login";
import RegisterPage from "./pages/register";
import DummyLoginPage from "./pages/dummy-login";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dummyLogin",
    element: <DummyLoginPage />,
  },
]);