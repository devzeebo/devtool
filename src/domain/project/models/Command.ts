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
};

export type Command = BaseCommand & (
  HealthcheckCommand
  | StartCommand
);
