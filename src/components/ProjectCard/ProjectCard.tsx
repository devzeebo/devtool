import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  first, size,
} from 'lodash/fp';
import type { Project } from '../../domain/project/models/Project';
import ProjectStatusIcon from '../ProjectStatusIcon';
import { useCommand } from '../CommandProvider/Context';

export type ProjectCardProps = {
  project: Project,
};

const ProjectCard = ({
  project,
}: ProjectCardProps) => {
  const startCmd = useCommand(project, 'start');

  return (
    <Card>
      <CardHeader
        avatar={(
          <Avatar>
            {first(project.name)}
          </Avatar>
        )}
        title={project.name}
        action={
          <ProjectStatusIcon project={project} />
        }
      />
      <CardContent>
        commands:
        {size(project.commands)}
        <br />
        projects:
        {size(project.projects)}
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={startCmd.start}>
          Start
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
