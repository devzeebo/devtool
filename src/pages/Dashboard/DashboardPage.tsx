import { useEffect, useState } from 'react';
import JSON5 from 'json5';
import {
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { map } from 'lodash/fp';
import type { Project } from '../../domain/project/models/Project';
import ProjectCard from '../../components/ProjectCard';
import Layout from '../../components/Layout';

const DashboardPage = () => {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(
    () => {
      (async () => {
        setProject(
          JSON5.parse<Project>(
            await readTextFile('/home/devzeebo/git/personal/devtool/example/example-project.devtool'),
          ),
        );
      })();
    },
    [],
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
