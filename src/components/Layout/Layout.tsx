import { GlobalStyles } from '@mui/material';
import type { PropsWithChildren } from 'react';

export type LayoutProps = PropsWithChildren<{}>;

const Layout = ({
  children,
}: LayoutProps) => {
  console.log('TODO: Implement Layout');
  return (
    <>
      <GlobalStyles styles={{
        html: {
          backgroundColor: '#E0E0E0',
        },
      }}
      />
      {children}
    </>
  );
};

export default Layout;
