import { useEffect } from 'react';
import {
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { map } from 'lodash/fp';
import ProjectCard from '../../components/ProjectCard';
import Layout from '../../components/Layout';
import { useProject } from '../../components/ProjectProvider';

const DashboardPage = () => {
  const { project, loadProject } = useProject();

  useEffect(
    () => {
      loadProject('');
    },
    [loadProject],
  );

  if (!project) {
    return null;
  }

  return (
    <Layout>
      <Grid container direction="column" rowSpacing="16px">
        {map((p) => (
          <Grid key={p.name}>
            <ProjectCard
              project={p}
            />
          </Grid>
        ), project.projects)}
      </Grid>
    </Layout>
  );
};

export default DashboardPage;
