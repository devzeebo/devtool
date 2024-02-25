import {
  List,
} from '@mui/material';
import { DescriptionOutlined } from '@mui/icons-material';
import type { Project } from '../../domain/project/models/Project';
import { useCommands } from '../CommandProvider';
import ProjectMenuLink from './ProjectMenuLink';

export type ProjectMenuProps = {
  project: Project
};

const ProjectMenu = ({
  project,
}: ProjectMenuProps) => {
  const commands = useCommands(project);

  return (
    <List>
      <ProjectMenuLink
        Icon={<DescriptionOutlined />}
        text="Logs"
        href={`/project/${project.name}/logs`}
      />
    </List>
  );
};

export default ProjectMenu;
