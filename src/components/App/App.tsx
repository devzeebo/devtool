import { withProviders } from '@react-shanties/core';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/Dashboard/DashboardPage';
import CommandProvider from '../CommandProvider/CommandProvider';
import ProjectProvider from '../ProjectProvider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
]);

export default withProviders([
  ProjectProvider,
  CommandProvider,
  [RouterProvider, { router }],
], '');
