import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  find, first, noop, size,
} from 'lodash/fp';
import { useCallback, useEffect, useState } from 'react';
import { Command } from '@tauri-apps/plugin-shell';
import type { Project } from '../../domain/project/models/Project';
import type { StartCommand } from '../../domain/project/models/Command';

export type ProjectCardProps = {
  project: Project,
};

const ProjectCard = ({
  project,
}: ProjectCardProps) => {
  const [startCmd, setStartCmd] = useState<Command<any> | null>(null);

  const startProject = useCallback(
    async () => {
      const start = find({ type: 'start' }, project.commands)! as StartCommand;

      console.log({ start });
      const cmd = Command.create(start.command, start.args, { cwd: '../example/server' });

      cmd.on('error', console.error);
      cmd.stdout.on('data', console.log);
      cmd.stderr.on('data', console.warn);

      setStartCmd(cmd);
    },
    [project.commands],
  );

  useEffect(
    () => {
      if (!startCmd) {
        return noop;
      }

      const process = startCmd.spawn();

      process.then((p) => console.log({ pid: p.pid }));

      return () => {
        process.then((p) => p.kill());
      };
    },
    [startCmd],
  );

  return (
    <Card>
      <CardHeader
        avatar={(
          <Avatar>
            {first(project.name)}
          </Avatar>
        )}
        title={project.name}
      />
      <CardContent>
        commands:
        {size(project.commands)}
        <br />
        projects:
        {size(project.projects)}
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={startProject}>
          Start
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
