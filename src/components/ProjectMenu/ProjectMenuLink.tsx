import { useCallback, type ReactNode } from 'react';
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export type ProjectMenuLinkProps = {
  Icon: ReactNode,
  text: string,
  href: string,
};

const ProjectMenuLink = ({
  Icon,
  text,
  href,
}: ProjectMenuLinkProps) => {
  const navigate = useNavigate();
  const gotoHref = useCallback(
    () => navigate(href),
    [href, navigate],
  );

  return (
    <ListItem>
      <ListItemButton onClick={gotoHref}>
        <ListItemIcon>
          {Icon}
        </ListItemIcon>
        <ListItemText>
          {text}
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export default ProjectMenuLink;
