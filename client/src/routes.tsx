import { createBrowserRouter } from 'react-router'
import { Navigate } from 'react-router'
import MainLayout from '@/layouts/main'
import LoginPage from '@/pages/auth/login'
import RegisterPage from '@/pages/auth/register'
import DummyLoginPage from '@/pages/auth/dummy-login'
import AssistantListPage from '@/pages/assistants/list'
import AssistantDetailPage from '@/pages/assistants/detail'
import MyRunsPage from '@/pages/runs/my'
import CreateCategoryPage from '@/pages/admin/categories/new'
import CreateAssistantPage from '@/pages/admin/assistants/new'
import EditAssistantPage from '@/pages/admin/assistants/edit'
import AdminRunsPage from '@/pages/admin/runs/index'
import { AuthGuard } from '@/components/guards/auth-guard'
import { AdminGuard } from '@/components/guards/admin-guard'

export const router = createBrowserRouter([
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'dummyLogin', element: <DummyLoginPage /> },
  {
    Component: AuthGuard,
    children: [
      {
        Component: MainLayout,
        children: [
          { index: true, element: <Navigate to="/assistants" replace /> },
          { path: 'assistants', element: <AssistantListPage /> },
          { path: 'assistants/:id', element: <AssistantDetailPage /> },
          { path: 'runs/my', element: <MyRunsPage /> },
          {
            Component: AdminGuard,
            children: [
              { path: 'admin/categories/new', element: <CreateCategoryPage /> },
              {
                path: 'admin/assistants/new',
                element: <CreateAssistantPage />,
              },
              {
                path: 'admin/assistants/:id/edit',
                element: <EditAssistantPage />,
              },
              { path: 'admin/runs', element: <AdminRunsPage /> },
            ],
          },
        ],
      },
    ],
  },
])
