import { createBrowserRouter, Navigate } from 'react-router'
import App from './App'
import { pageRoutes } from './routes/pageRoutes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to={pageRoutes[0]?.path ?? '/'} replace />,
      },
      ...pageRoutes.map(({ path, Component }) => ({
        path: path.slice(1),
        element: <Component />,
      })),
    ],
  },
])
