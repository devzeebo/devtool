import {
  Unstable_Grid2 as Grid,
} from '@mui/material';
import { drop, find } from 'lodash/fp';
import { useMemo } from 'react';
import type { Project } from '../../domain/project/models/Project';
import type { CommandHook } from '../CommandProvider/Context';
import { useCommand } from '../CommandProvider';

export type ProjectStatusIconProps = {
  project: Project,
};

type Predicate = (hook: CommandHook) => boolean;
const colorMap: Array<[Predicate, string, string]> = [
  [(hook) => hook.state === 'started', 'green', 'Started'],
  [(hook) => hook.state === 'stopped' && !!hook.exitCode, 'red', 'Crashed'],
  [(hook) => hook.state === 'stopped' && !hook.exitCode, 'yellow', 'Stopped'],
];

const ProjectStatusIcon = ({
  project,
}: ProjectStatusIconProps) => {
  const startCmd = useCommand(project, 'start');

  const [indicatorColor, indicatorText] = useMemo(
    () => {
      const matched = find(([p]) => p(startCmd), colorMap)!;

      return drop(1, matched) as string[];
    },
    [startCmd],
  );

  return (
    <Grid container alignItems="center" columnSpacing="8px">
      <Grid sx={{
        width: '1em',
        height: '1em',
        borderRadius: '1000px',
        bgcolor: indicatorColor,
      }}
      />
      <Grid>{indicatorText}</Grid>
    </Grid>
  );
};

export default ProjectStatusIcon;
