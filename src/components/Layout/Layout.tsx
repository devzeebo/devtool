import { GlobalStyles } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type LayoutProps = PropsWithChildren<{}>;

const Layout = ({
  children,
}: LayoutProps) => (
  <>
    <GlobalStyles styles={{
      'html, body, #root': {
        margin: 0,
        minHeight: '100vh',
        height: '100vh',
      },
      html: {
        backgroundColor: '#E0E0E0',
      },
      '#root': {
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
      },
    }}
    />
    {children}
  </>
);

export default Layout;
