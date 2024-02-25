import {
  Button,
  Card,
  CardActions,
  CardContent,
} from '@mui/material';
import {
  size,
} from 'lodash/fp';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import type { Project } from '../../domain/project/models/Project';
import { useCommand } from '../CommandProvider';
import ProjectCardHeader from './ProjectCardHeader';

export type ProjectCardProps = {
  project: Project,
};

const ProjectCard = ({
  project,
}: ProjectCardProps) => {
  const startCmd = useCommand(project, 'start');

  const navigate = useNavigate();
  const gotoProject = useCallback(
    () => {
      navigate(`/project/${project.name}`);
    },
    [navigate, project.name],
  );

  return (
    <Card>
      <ProjectCardHeader
        project={project}
        onClick={gotoProject}
      />
      <CardContent>
        commands:
        {size(project.commands)}
        <br />
        projects:
        {size(project.projects)}
      </CardContent>
      <CardActions>
        {
          startCmd.state === 'started'
            ? (
              <Button variant="contained" onClick={startCmd.stop} color="error">
                Stop
              </Button>
            )
            : (
              <Button variant="contained" onClick={startCmd.start}>
                Start
              </Button>
            )
          }
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
