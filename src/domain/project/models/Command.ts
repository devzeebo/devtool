export type HealthcheckCommand = {
  type: 'healthcheck',
  cron: string,
  expect: string,
};

export type StartCommand = {
  type: 'start',
};

export type BaseCommand = {
  command: string | string[],
  workingDirectory?: string,
};

export type ProjectCommand = BaseCommand & (
  HealthcheckCommand
  | StartCommand
);
