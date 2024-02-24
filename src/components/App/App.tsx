import { withProviders } from '@react-shanties/core';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import DashboardPage from '../../pages/Dashboard/DashboardPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
]);

export default withProviders([
  [RouterProvider, { router }],
], '');
