import { createBrowserRouter } from "react-router";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "./pages/auth/register";
import DummyLoginPage from "./pages/auth/dummy-login";
import MainLayout from "./layouts/main";
import AssistantRunPage from "./pages/assistants/run";
import AssistantListPage from "./pages/assistants/list";

export const router = createBrowserRouter([
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
  { path: "dummyLogin", element: <DummyLoginPage /> },
  {
    Component: MainLayout,
    children: [
      { 
        path: 'assistants',
        children: [
          { index: true, element: <AssistantListPage /> },
          { path: "run", element: <AssistantRunPage /> },
        ] 
      }
    ]
  }
]);