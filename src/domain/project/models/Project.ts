import type { Command } from './Command';

export type Project = {
  name: string,

  commands: Command[],

  projects: Project[],
};
