import { createBrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/Dashboard/DashboardPage';
import ProjectDashboard from '../../pages/ProjectDashboard';
import ProjectDashboardLogs from '../../pages/ProjectDashboard/children/Logs/Logs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/project/:name',
    element: <ProjectDashboard />,
    children: [
      {
        path: 'logs',
        element: <ProjectDashboardLogs />,
      },
    ],
  },
]);
