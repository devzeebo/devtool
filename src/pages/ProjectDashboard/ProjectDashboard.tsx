import { Outlet, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { find } from 'lodash/fp';
import {
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { useProject } from '../../components/ProjectProvider';
import Layout from '../../components/Layout';
import { ProjectCardHeader } from '../../components/ProjectCard';
import ProjectMenu from '../../components/ProjectMenu';
import type { Project } from '../../domain/project/models/Project';

export type ProjectDashboardContext = {
  project: Project,
};

const ProjectDashboard = () => {
  const { name: projectName } = useParams();

  const { project: rootProject } = useProject();

  const project = useMemo(
    () => find({ name: projectName }, rootProject?.projects),
    [projectName, rootProject?.projects],
  );

  const context: ProjectDashboardContext = useMemo(
    () => ({
      project: project!,
    }),
    [project],
  );

  if (!project) {
    return null;
  }

  return (
    <Layout>
      <Grid
        container
        direction="column"
        flex="1"
      >
        <Grid>
          <ProjectCardHeader project={project} />
        </Grid>
        <Grid container flex="1 0 0">
          <Grid flex="0 0 auto">
            <ProjectMenu project={project} />
          </Grid>
          <Grid
            container
            flex="1 0 0"
            direction="column"
            sx={{
              p: '1em',
              pr: '.5em',
            }}
          >
            <Outlet context={context} />
          </Grid>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default ProjectDashboard;
