import type { CardHeaderProps } from '@mui/material';
import { Avatar, CardHeader } from '@mui/material';
import { first } from 'lodash/fp';
import type { Project } from '../../domain/project/models/Project';
import ProjectStatusIcon from '../ProjectStatusIcon';

export type ProjectCardHeaderProps = CardHeaderProps & {
  project: Project,
};

const ProjectCardHeader = ({
  project,
  ...props
}: ProjectCardHeaderProps) => (
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
    {...props}
  />
);

export default ProjectCardHeader;
