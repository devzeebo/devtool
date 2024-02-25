import { withProviders } from '@react-shanties/core';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CommandProvider from '../CommandProvider/CommandProvider';
import ProjectProvider from '../ProjectProvider';
import { router } from './routers';

const theme = createTheme({
  components: {
    MuiGrid2: {
      defaultProps: {
        flexWrap: 'nowrap',
      },
    },
  },
});

export default withProviders([
  [ThemeProvider, { theme }],
  ProjectProvider,
  CommandProvider,
  [RouterProvider, { router }],
], '');
