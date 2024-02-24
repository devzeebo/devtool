import type { ProjectCommand } from './Command';

export type Project = {
  name: string,
  workingDirectory: string,

  commands: ProjectCommand[],

  projects: Project[],
};
